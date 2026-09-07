"""Software rasterization of exported game geometry for composition inspection.
Requires numpy, Pillow, numba. Lighting approximates the runtime; this is not WebGL QA.
"""
import json,sys,numpy as np
from PIL import Image
from numba import njit
prefix=sys.argv[1]
m=json.load(open(prefix+'.json'));w,h=m['width'],m['height']
p=np.fromfile(prefix+'-positions.bin',dtype=np.float32).reshape(-1,3)
n=np.fromfile(prefix+'-normals.bin',dtype=np.float32).reshape(-1,3)
c=np.fromfile(prefix+'-colors.bin',dtype=np.float32).reshape(-1,3)
proj=np.array(m['projection']).reshape(4,4,order='F');view=np.array(m['view']).reshape(4,4,order='F')
clip=np.c_[p,np.ones(len(p))]@(proj@view).T
screen=clip[:,:3]/clip[:,3,None];screen[:,0]=(screen[:,0]+1)*w/2;screen[:,1]=(1-screen[:,1])*h/2
sun=np.array(m['sun'])-np.array(m['target']);sun/=np.linalg.norm(sun)
x=np.cross([0,1,0],sun);x/=np.linalg.norm(x);y=np.cross(sun,x);basis=np.array([x,y,sun]);light=(p-np.array(m['target']))@basis.T
ls=light.copy();ls[:,0]=(ls[:,0]/45+1)*512;ls[:,1]=(1-ls[:,1]/45)*512;ls[:,2]=-ls[:,2]
@njit
def raster_shadow(v):
 depth=np.full((1024,1024),1e10)
 for i in range(0,len(v),3):
  a,b,c=v[i],v[i+1],v[i+2];den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1])
  if abs(den)<.001:continue
  for yy in range(max(0,int(min(a[1],b[1],c[1]))),min(1023,int(max(a[1],b[1],c[1])))+1):
   for xx in range(max(0,int(min(a[0],b[0],c[0]))),min(1023,int(max(a[0],b[0],c[0])))+1):
    u=((b[1]-c[1])*(xx-c[0])+(c[0]-b[0])*(yy-c[1]))/den;v1=((c[1]-a[1])*(xx-c[0])+(a[0]-c[0])*(yy-c[1]))/den;t=1-u-v1
    if min(u,v1,t)<0:continue
    z=u*a[2]+v1*b[2]+t*c[2]
    if z<depth[yy,xx]:depth[yy,xx]=z
 return depth
@njit
def render(s,clipw,n,c,ls,shadow,sun,w,h,fog):
 out=np.empty((h,w,3),dtype=np.float32);out[:,:,:]=fog;depth=np.full((h,w),1e10)
 for i in range(0,len(s),3):
  if min(clipw[i],clipw[i+1],clipw[i+2])<.1:continue
  a,b,d=s[i],s[i+1],s[i+2];den=(b[1]-d[1])*(a[0]-d[0])+(d[0]-b[0])*(a[1]-d[1])
  if abs(den)<.001:continue
  loX=max(0,int(min(a[0],b[0],d[0])));hiX=min(w-1,int(max(a[0],b[0],d[0])));loY=max(0,int(min(a[1],b[1],d[1])));hiY=min(h-1,int(max(a[1],b[1],d[1])))
  for yy in range(loY,hiY+1):
   for xx in range(loX,hiX+1):
    u=((b[1]-d[1])*(xx-d[0])+(d[0]-b[0])*(yy-d[1]))/den;v=((d[1]-a[1])*(xx-d[0])+(a[0]-d[0])*(yy-d[1]))/den;t=1-u-v
    if min(u,v,t)<-.001:continue
    z=u*a[2]+v*b[2]+t*d[2]
    if z>=depth[yy,xx]:continue
    depth[yy,xx]=z
    uu=u/clipw[i];vv=v/clipw[i+1];tt=t/clipw[i+2];total=uu+vv+tt;uu/=total;vv/=total;tt/=total
    norm=n[i]*uu+n[i+1]*vv+n[i+2]*tt;norm/=max(.01,np.sqrt((norm*norm).sum()));light=max(0,(norm*sun).sum())
    l=ls[i]*uu+ls[i+1]*vv+ls[i+2]*tt;sx=int(l[0]);sy=int(l[1]);shade=1.
    if 0<=sx<1024 and 0<=sy<1024 and l[2]>.18+shadow[sy,sx]:shade=.18
    color=c[i]*uu+c[i+1]*vv+c[i+2]*tt;color*=.53+1.35*light*shade
    color=(color*(2.51*color+.03))/(color*(2.43*color+.59)+.14)
    f=max(0,min(1,((1/total)-65)/130));color=color*(1-f)+fog*f
    for k in range(3):out[yy,xx,k]=max(0,min(1,color[k]))
 return out
shadow=raster_shadow(ls)
out=render(screen,clip[:,3],n,c,ls,shadow,sun,w,h,np.array(m['fog']))
out=np.power(out,1/2.2);Image.fromarray((out*255).astype('uint8')).save(prefix+'.png');print(prefix+'.png')
