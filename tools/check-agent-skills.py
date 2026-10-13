"""Verify project-local skill discovery through Codex's native read-only API."""
import json
import os
from pathlib import Path
import selectors
import subprocess
import tempfile
import time


def main():
    root = Path(__file__).resolve().parent.parent
    expected = set(json.loads((root / "skills-lock.json").read_text())["skills"])
    with tempfile.TemporaryDirectory(prefix="patchling-skills-") as temporary:
        process = subprocess.Popen(
            ["codex", "app-server", "-c", f'sqlite_home="{temporary}/state"',
             "-c", f'log_dir="{temporary}/logs"', "--listen", "stdio://"],
            cwd=root, stdin=subprocess.PIPE, stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
        )
        selector = selectors.DefaultSelector()
        selector.register(process.stdout, selectors.EVENT_READ)
        pending = b""

        def send(message):
            process.stdin.write(json.dumps(message).encode() + b"\n")
            process.stdin.flush()

        def request(method, params, request_id):
            nonlocal pending
            send({"id": request_id, "method": method, "params": params})
            deadline = time.monotonic() + 25
            while time.monotonic() < deadline:
                while b"\n" in pending:
                    line, pending = pending.split(b"\n", 1)
                    response = json.loads(line)
                    if response.get("id") == request_id:
                        if "error" in response:
                            raise RuntimeError(response["error"].get("message", "Codex request failed"))
                        return response["result"]
                if not selector.select(timeout=1):
                    continue
                chunk = os.read(process.stdout.fileno(), 65536)
                if not chunk:
                    raise RuntimeError("Codex app-server closed before discovery completed")
                pending += chunk
            raise RuntimeError("Codex skill discovery timed out")

        try:
            request("initialize", {"clientInfo": {"name": "patchling_skill_discovery", "version": "1.0.0"},
                                   "capabilities": {"experimentalApi": True}}, 1)
            send({"method": "initialized", "params": {}})
            result = request("skills/list", {"cwds": [str(root)], "forceReload": True}, 2)
            entry = next(item for item in result["data"] if item["cwd"] == str(root))
            found = {item["name"]: item for item in entry["skills"]
                     if item["name"] in expected and Path(item["path"]).is_relative_to(root / ".agents/skills")}
            report = {"installed": len(expected), "discovered": len(found),
                      "missing": sorted(expected - found.keys()),
                      "disabled": sorted(name for name, item in found.items() if not item["enabled"]),
                      "wrongScope": sorted(name for name, item in found.items() if item["scope"] != "repo"),
                      "errors": entry["errors"]}
            print(json.dumps(report))
            if any(report[key] for key in ("missing", "disabled", "wrongScope", "errors")):
                raise SystemExit(1)
        finally:
            selector.close()
            process.terminate()
            try:
                process.wait(timeout=3)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait()


if __name__ == "__main__":
    try:
        main()
    except (OSError, RuntimeError, ValueError, KeyError, StopIteration) as error:
        print(json.dumps({"status": "unavailable", "reason": str(error)}))
        raise SystemExit(1)
