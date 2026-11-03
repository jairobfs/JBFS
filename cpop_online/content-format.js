/* CPOP · formatação pedagógica do conteúdo vindo do Craft
   Aceita apenas uma sintaxe Markdown limitada, escapando HTML original. */
(function(root){
  'use strict';
  const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,ch=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[ch]);
  function inline(value){
    let text=escapeHTML(value);
    text=text.replace(/`([^`\n]+)`/g,'<code>$1</code>');
    text=text.replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>');
    text=text.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g,'$1<em>$2</em>');
    return text;
  }
  function render(value){
    const lines=String(value??'').replace(/\r\n?/g,'\n').split('\n');
    const result=[];let i=0;
    const isBlank=s=>!s.trim();
    const isQuote=s=>/^\s*>\s?/.test(s);
    const isBullet=s=>/^\s*[-*]\s+/.test(s);
    const isOrdered=s=>/^\s*\d{1,3}[.)]\s+/.test(s);
    const isHeading=s=>/^\s*#{1,4}\s+/.test(s);
    const special=s=>isBlank(s)||isQuote(s)||isBullet(s)||isOrdered(s)||isHeading(s);
    while(i<lines.length){
      const line=lines[i];
      if(isBlank(line)){i++;continue;}
      if(isHeading(line)){
        const match=line.match(/^\s*(#{1,4})\s+(.+)$/);
        if(match){const level=Math.min(5,match[1].length+2);result.push('<h'+level+'>'+inline(match[2])+'</h'+level+'>');i++;continue;}
      }
      if(isQuote(line)){
        const fragments=[];
        while(i<lines.length&&isQuote(lines[i])){fragments.push(inline(lines[i].replace(/^\s*>\s?/,'')));i++;}
        result.push('<blockquote><p>'+fragments.join('<br>')+'</p></blockquote>');continue;
      }
      if(isBullet(line)||isOrdered(line)){
        const ordered=isOrdered(line),tag=ordered?'ol':'ul',pattern=ordered?/^\s*\d{1,3}[.)]\s+/:/^\s*[-*]\s+/;
        const fragments=[];
        while(i<lines.length&&(ordered?isOrdered(lines[i]):isBullet(lines[i]))){
          fragments.push('<li>'+inline(lines[i].replace(pattern,''))+'</li>');i++;
        }
        result.push('<'+tag+'>'+fragments.join('')+'</'+tag+'>');continue;
      }
      const paragraph=[];
      while(i<lines.length&&!special(lines[i])){paragraph.push(inline(lines[i].trim()));i++;}
      if(paragraph.length)result.push('<p>'+paragraph.join('<br>')+'</p>');
      else i++;
    }
    return result.join('');
  }
  root.CPOPContent=Object.freeze({render,inline,escapeHTML});
})(typeof window==='undefined'?globalThis:window);
