'use strict';

// Gabaritos permanecem no servidor. Este arquivo não é servido como recurso estático.
const version = '2026-10-29.1';
const activities = [
  {
    id: 's24-diversidade', week: 24, type: 'trilha', eyebrow: 'Semana 24',
    title: 'Vozes do Brasil', theme: 'Cultura, variação e respeito',
    subtitle: 'Decifre situações reais de diversidade linguística e cultural.',
    color: '#CC795D', duration: 18,
    questions: [
      {id:'24-01',type:'choice',prompt:'Uma estudante ridiculariza o colega porque ele diz “nós vai”. O que essa atitude revela?',options:['Mudança histórica da língua.','Preconceito linguístico.','Uso da função poética.','Uma inferência gramatical válida.'],answer:2,why:'A variedade linguística usada por alguém não determina sua inteligência ou competência comunicativa.',evidence:true},
      {id:'24-02',type:'choice',prompt:'Em uma entrevista de emprego, alguém escolhe formas próximas à norma-padrão. Isso significa:',options:['Abandonar sua identidade.','Reconhecer que a fala familiar é inferior.','Adequar o registro à situação.','Eliminar a diversidade linguística.'],answer:3,why:'Dominar diferentes registros amplia possibilidades de comunicação; não exige rejeitar variedades pessoais.'},
      {id:'24-03',type:'choice',prompt:'Qual frase descreve melhor a realidade dos povos indígenas no Brasil?',options:['São povos com línguas, histórias e vivências diversas.','Todos compartilham a mesma língua.','Suas produções culturais pertencem apenas ao passado.','Vivem exclusivamente em locais sem cidades.'],answer:1,why:'Os povos indígenas são plurais e contemporâneos, com experiências territoriais e linguísticas distintas.'},
      {id:'24-04',type:'choice',prompt:'Uma professora afirma: “Nenhuma cultura cabe em uma imagem só”. O que ela critica?',options:['A leitura de romances urbanos.','O uso da norma-padrão.','A existência de diferentes gêneros literários.','A redução das culturas a estereótipos.'],answer:4,why:'A afirmação contesta representações simplificadoras que apagam a diversidade interna de cada cultura.',evidence:true},
      {id:'24-05',type:'choice',prompt:'Uma pesquisa registra sotaques de diferentes regiões brasileiras. Que conclusão é adequada?',options:['Apenas um sotaque é legítimo.','Sotaques expressam diversidade histórica e social.','Todo sotaque é erro de pronúncia.','Sotaques só existem na comunicação informal.'],answer:2,why:'Variação regional é característica normal das línguas e não hierarquia de inteligência.'},
      {id:'24-06',type:'choice',prompt:'Uma postagem afirma que “falar corretamente” é a única condição para ser respeitado. Qual resposta é mais pertinente?',options:['Toda variação deve ser proibida.','A norma-padrão nunca deve ser ensinada.','Respeito não depende de aderência à norma-padrão.','O contexto não altera a escolha de registro.'],answer:3,why:'O domínio da norma-padrão é útil em contextos específicos, mas respeito é devido a todos os falantes.'},
      {id:'24-07',type:'choice',prompt:'Uma escritora negra e um autor indígena apresentam histórias sobre a vida nas cidades. Um leitor se surpreende: esperava apenas narrativas antigas. Isso sugere que o leitor:',options:['Tinha uma expectativa estereotipada.','Conhecia toda a literatura contemporânea.','Desconfiava da escrita acadêmica.','Não compreendeu a função fática.'],answer:1,why:'A surpresa decorre de uma imagem limitada sobre temas e experiências desses autores.',evidence:true},
      {id:'24-08',type:'choice',prompt:'Qual prática de sala valoriza a diversidade e também ensina recursos da norma-padrão?',options:['Corrigir publicamente sotaques.','Excluir gêneros orais.','Tratar toda variação como erro moral.','Comparar registros e discutir adequação sem discriminar falantes.'],answer:4,why:'O ensino de registros e a valorização das variedades não são incompatíveis.'}
    ]
  },
  {
    id: 's25-arena', week: 25, type: 'arena', eyebrow: 'Semana 25',
    title: 'Arena dos Sentidos', theme: 'Funções, tirinhas e memes',
    subtitle: 'Rodadas rápidas para interpretar, comparar e justificar.',
    color: '#2CA08E', duration: 16,
    questions: [
      {id:'25-01',prompt:'“A apresentação começa às 14 horas.” Qual função predomina?',options:['Referencial.','Fática.','Poética.','Emotiva.'],answer:1,why:'A frase prioriza transmitir uma informação.'},
      {id:'25-02',prompt:'“Participe hoje! Inscreva-se.” Qual função predomina?',options:['Metalinguística.','Emotiva.','Conativa.','Fática.'],answer:3,why:'Os imperativos procuram mobilizar o destinatário.'},
      {id:'25-03',prompt:'“Alô, você está me ouvindo?” Qual função predomina?',options:['Poética.','Fática.','Referencial.','Metalinguística.'],answer:2,why:'A mensagem verifica o contato/canal.'},
      {id:'25-04',prompt:'“A palavra saudade é um substantivo.” Qual função predomina?',options:['Emotiva.','Conativa.','Fática.','Metalinguística.'],answer:4,why:'A língua está sendo utilizada para explicar uma palavra da própria língua.'},
      {id:'25-05',prompt:'“A lua bordava prata no silêncio da noite.” Qual função predomina?',options:['Poética.','Referencial.','Fática.','Conativa.'],answer:1,why:'O efeito expressivo da forma e da imagem figurada é central.'},
      {id:'25-06',prompt:'“Estou muito feliz com essa conquista!” Qual função predomina?',options:['Conativa.','Metalinguística.','Emotiva.','Fática.'],answer:3,why:'A mensagem destaca o sentimento do emissor.'},
      {id:'25-07',prompt:'Verdadeiro ou falso? O sentido de um meme depende exclusivamente das palavras escritas.',options:['Verdadeiro.','Falso.'],answer:2,why:'Imagem, contexto e repertório cultural também participam do sentido.'},
      {id:'25-08',prompt:'Verdadeiro ou falso? O contexto pode modificar a interpretação de uma frase.',options:['Verdadeiro.','Falso.'],answer:1,why:'A mesma frase pode produzir sentidos diferentes conforme o contexto.'},
      {id:'25-09',prompt:'Verdadeiro ou falso? A ironia pode sugerir um sentido oposto ao literal.',options:['Verdadeiro.','Falso.'],answer:1,why:'O contraste entre o que se diz e o que se pretende comunicar pode criar ironia.'},
      {id:'25-10',prompt:'Meme: “Eu, às 21h: hoje vou dormir cedo. Também eu, às 2h: só mais um vídeo.” O humor resulta:',options:['Da ausência de interlocutor.','Da contradição entre intenção e comportamento.','De uma definição gramatical.','De uma descrição científica.'],answer:2,why:'A promessa de dormir cedo é contrariada pelo uso prolongado do celular.',evidence:true},
      {id:'25-11',prompt:'Tirinha: “Estudei tudo sobre nuvens!” / Começa a chover. / “Só esqueci o guarda-chuva!” O desfecho explora:',options:['Confusão de personagens.','Uso de regionalismo.','Conhecimento teórico sem preparo prático.','Uma sequência cronológica impossível.'],answer:3,why:'O personagem conhece a teoria, mas não tomou uma medida prática diante da chuva.',evidence:true},
      {id:'25-12',prompt:'Verdadeiro ou falso? Uma mensagem pode combinar diferentes funções da linguagem.',options:['Verdadeiro.','Falso.'],answer:1,why:'As funções podem coexistir; identifica-se a predominante em cada contexto.'}
    ]
  },
  {
    id: 's26-escape', week: 26, type: 'escape', eyebrow: 'Semana 26',
    title: 'O Código das Entrelinhas', theme: 'Escape Room de inferências',
    subtitle: 'Quatro estações, quatro evidências e um código final.',
    color: '#D8AA61', duration: 15,
    questions: [
      {id:'26-01',prompt:'Bruno entrou na sala com cabelo molhado e casaco pingando. O céu estava cinza; o ônibus havia atrasado. O que é mais plausível?',options:['Esqueceu um compromisso.','Provavelmente se molhou na chuva.','Tinha acabado de nadar.','Perdeu uma prova.'],answer:2,why:'Cabelo e casaco molhados, junto do céu cinza, sustentam a hipótese de chuva, não as demais.',evidence:true},
      {id:'26-02',prompt:'Tirinha: cartaz “Silêncio” na biblioteca; todos leem; um celular toca vídeo alto e todos olham para ele. De onde vem o humor?',options:['Das letras pequenas do cartaz.','Da falta de livros.','Da ausência de funcionários.','Do som que contradiz o pedido de silêncio.'],answer:4,why:'O humor surge da interrupção do silêncio esperado.',evidence:true},
      {id:'26-03',prompt:'Bilhete: “Cheguei à praça quando os feirantes guardavam as mercadorias. Amanhã sairei mais cedo.” O que se infere?',options:['Chegou tarde para aproveitar a feira.','Havia uma festa.','A praça entrará em reforma.','Não gosta de feiras.'],answer:1,why:'As bancas estavam fechando quando a pessoa chegou; isso motiva sair mais cedo amanhã.',evidence:true},
      {id:'26-04',prompt:'Cartaz com pessoas de várias regiões: “A gente se entende, mesmo falando diferente.” Qual a mensagem implícita?',options:['É necessário abandonar sotaques.','Só existe uma forma legítima de falar.','A diferença linguística não impede o diálogo nem justifica preconceito.','Toda situação exige a mesma variedade.'],answer:3,why:'A diversidade linguística é apresentada como compatível com diálogo e respeito.',evidence:true}
    ]
  }
];

function publicCatalog() {
  return {version, activities: activities.map(({id,week,type,eyebrow,title,theme,subtitle,color,duration,questions}) => ({id,week,type,eyebrow,title,theme,subtitle,color,duration,questions:questions.map(({id,prompt,options,evidence})=>({id,prompt,options,evidence:!!evidence}))}))};
}

module.exports={version,activities,publicCatalog};
