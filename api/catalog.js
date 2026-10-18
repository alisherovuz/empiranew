// Public aggregate catalogue metadata only. No user information.
const C=require('./_lib/curriculum');
module.exports=(req,res)=>{
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Cache-Control','public, max-age=300, s-maxage=3600');
  if(req.method!=='GET')return res.status(405).json({error:'method_not_allowed'});
  const {grades,content}=C.load();
  const topics=Object.values(grades).flatMap((g)=>g.topics).filter((t)=>t.lab&&(content[t.slug]?.labs||[]).length);
  const labs=new Set(topics.flatMap((t)=>content[t.slug].labs.map((l)=>l.slug)));
  return res.status(200).json({topics:topics.length,labs:labs.size,grades:C.grades()});
};
