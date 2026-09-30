export async function compareMaterials(page){
 return page.evaluate(()=>{
  const roots=[window.studio.root,window.studio.scene.getObjectByName('Independent exported GLB')];
  const capture=root=>{const result={};root.traverse(o=>{if(!o.isMesh)return;const m=o.material;
   const tex=t=>t?{colorSpace:t.colorSpace,repeat:t.repeat.toArray(),offset:t.offset.toArray(),rotation:t.rotation,wrapS:t.wrapS,wrapT:t.wrapT,anisotropy:t.anisotropy}:null;
   const anis=m.anisotropy??0,coat=m.clearcoat??0;
   result[m.name]={color:m.color?.toArray(),sheen:(m.sheenColor?.toArray()||[0,0,0]).map(v=>v*(m.sheen||0)),roughness:m.roughness??1,metalness:m.metalness??0,specularIntensity:m.specularIntensity??1,clearcoat:coat,clearcoatRoughness:coat>0?(m.clearcoatRoughness??0):0,anisotropy:anis,anisotropyRotation:anis>0?(m.anisotropyRotation??0):0,alphaTest:m.alphaTest??0,side:m.side,opacity:m.opacity,normalScale:m.normalMap?m.normalScale.toArray():null,map:tex(m.map),normalMap:tex(m.normalMap),roughnessMap:tex(m.roughnessMap)};
  });return result;};
  const [authored,exported]=roots.map(capture),differences=[];
  function compare(a,b,key){
   if(typeof a==='number'&&typeof b==='number'){if(Math.abs(a-b)>1e-6)differences.push({key,authored:a,exported:b});return;}
   if(a===null||b===null||a===undefined||b===undefined||typeof a!=='object'||typeof b!=='object'){if(a!==b)differences.push({key,authored:a,exported:b});return;}
   for(const k of Object.keys(a))compare(a[k],b[k],key+'.'+k);
  }
  for(const name of Object.keys(authored))compare(authored[name],exported[name],name);
  return {matched:differences.length===0,differences,authored,exported};
 });
}
