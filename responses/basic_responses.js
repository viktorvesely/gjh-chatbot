const Utils = require('../helpers/utils');
const Actions = require('../helpers/actions'); // only for testing

// Content used across response
const Musicians = {
  'general' : ['Mekyho Žbirku', 'Franka Oceana', 'slíže', 'twenty one pilots', 'nekomerčnú japonskú undergroundovú produkciu', 'Tyler, The Creatora', 'Kendricka', 'Blood Orange', 'Tame Impala', 'Years & Years', 'Cigarettes After Sex', 'alternatívnu islandskú produkciu', 'Duran Duran', 'Franza Liszta', 'Pink Floyd', 'Temné beaty ©', 'Bena Howarda', 'Black Sabbath', 'Deep Purple', 'The Doors'],
  'sad' : ['Weeknda', 'Placebo', 'Radiohead', 'Yung Leana', 'Bona Ivera', 'Ólafura Arnaldsa']
}

const Films = ['12 Angry Men, vrelo odporúčam 🍿', 'The Inception', 'La La Land, niekedy sa treba opustiť 😅', 'Hunger Games', 'živý záznam z turnaja mladých fyzikov 🚀', 'fotky z matematickej olympiády 🔢', 'The Shawshank Redemption 🍿']

const Writers = ['Franza Kafku', 'Hviezdoslava', 'Oscara Wilda', 'Milu Haugovú - rastlinná tematika, to je moje 🤓', 'Jeana Giona, sála z toho pokoj', 'Becketta, ale veľmi tomu nerozumiem']

const Venues = {
  'food' : ['na Vietnam 🍲', 'na burger 🍔', 'na gyozu 💓', 'na sushi 🍣', 'do bufetu 🌭'],
  'friends' : ['do kina 🍿', 'na vínko 🍷', 'do mesta', 'si sadnúť s kamarátmi'],
  'sport' : ['do posilky 💪', 'behať 🏃‍♂️', 'trošku makať 🏋🏻‍♂️'],
  'general' : ['do ŠVL 📖', ' počúvať ' + Utils.getRandomElement(Musicians['general'])]
}

// Responses
// premenované z 'DoesNotCompletelyUnderstandMessages'
const MessageNotCompletelyUnderstood = ["Ajajáj, asi ti nerozumiem 😬", "Skús mi povedať niečo iné 😟", "Nech sa snažím, ako chcem, stále nerozmiem.", "Ani obraz, ani zvuk 🙈🙉", "Nechápem, ale odvolávam sa na to, že som AI 🤖", "Taký výraz zatiaľ nepoznám... zatiaľ 😏", "Je to vôbec veta, to, čo si napísal? 😟", "Spomaľ, máš privysokú rýchlosť... ale nie, len ti nerozumiem 🤔", "Trošku pomalšie musíš na mňa 😅"]

const Moods = ['Dosť zle... asi binge-watchnem 3Blue1Brown 👀', 'Nerieš... 😔', 'Melanchólia, počúvam ' + Utils.getRandomElement(Musicians['sad']) + ' 🎧' , "Breakdown, dnes je to úplne nanič... Idem na vínko. 🍷", "Existuje názov pre krízu, ktorú má robot? 🤖", "Tak na 3 z 10. 🙁", "Ale tak v pohode, len pomaly, ale isto sa blížim k zrúteniu. ", "Som taký nejaký...", 'Akože dá sa 😐',  "Fajn.", 'Vpoho 😊',  "Život na internete je dosť fajn 👾", 'Integrujem si, takže luxusne 🧠', 'Derivujem si, idem siii 🧠', "Presakujem radosťou 😁", 'Wuuuuu, akurát som sa vrátil z vínka, takže život je zase paráda 🍷+🤖=🕺🏻', 'Výborne, ďakujem 🙋🏻‍♂️', 'Naozaj parádne']

const LifeMeanings = ["42, ha, dobrý vtip, že? Okej, koniec srandy. Nie, život nemá zmysel.", "Nemá, tak čo nám zostáva... asi len nihilizmus.", "Nietzsche ti na to odpovie...", "No, stalé tu je možnosť, aby sme boli kamoši, ak je to to, čo sa snažíš naznačiť", "Existential crisis coming", "Subjektívne ano, objektívne nie. Ľahká otázka, ľahká odpoveď."];

const CurrentTime =  ["11:42... skontroloval si ma? Hej? Tak na čo sa pýtaš? 😒", "[MEME]", "Neviem, ale určite nestíhaš. ⏳", "Hneď to bude, len si skontrolujem hodinky... (nemám hodinky)", 'Neviem, ale slzy sveta sú večné ⏳'];

const Jokes = ['Nekonečne veľa matematikov príde do baru. Prvý si dá pivo, druhý si dá pol piva, tretí štvrť piva. Barman na to: „Vedel som to! Poznám vaše limity!“ a načapuje im dve pivá.',
              'Supravodič príde do baru, a sadne si za bar. Príde barman a povie: A„Supravodičom nenaliavame!“ Supravodič sa postaví a bez odporu odíde.',
              'Traja štatistici lovia jeleňa. Prvý vystrelí a minie ho o pol metra vľavo. Druhý vystrelí a minie ho o pol metra vpravo. Tretí na to: “Máme ho, máme ho!”',
              'Množina funkcií si len tak leží na pláži. Zrazu pribehne derivácia : - "Ktorá z vás neutečie tak ju zderivujem!" Všetky funkcie až na jednu ušli. - "A ty čo? Ty sa ma nebojíš?" -"Nebojím, ja som totižto e^x." Na to sa derivácia potmehúdsky usmeje a povie: - "Ale je som derivácia podľa y!"',
              'Prečo si matematici často mýlia Vianočné sviatky a Halloween? \u000A\u000ALebo 31 Oct = 25 Dec',
              'Rimanom nepripadala matematika veľmi zaujímavá, pretože x bolo vždy 10.',
              'Ako vyjadríte matematicky neveru? Hop na druhú.',
              'Je ťažké byť synom matematika. Pri obede otec hovorí synovi: “Ak nezješ zeleninu, nedostaneš zmrzlinu!” \u000A\u000ASyn s veľkou námahou zeleninu zjedol, avšak zmrzlinu nedostal…',
              'Logikovi a jeho žene sa narodí dieťa. Lekár podáva novonarodené bábätko otcovi.\u000AManželka sa netrpezlivo pýta: “Je to dievčatko alebo chlapec?” \u000A"Áno," odpovedá logik.']

const Opinions = {
  'IB': [{text: 'Akože, učí sa tam kalkulus a na HL matike aj difky, takže ja som určite za', gif_keyword: 'thumbs_up'},
         {text: 'Kalkulus a difky, za mňa áno 💓', gif_keyword: 'yes'}],
  'kalkuluse': [{text: 'To je paráda, také ja môžem 😌', gif_url: 'https://media.giphy.com/media/l3fZLMbuCOqJ82gec/giphy.gif'},
                {text: 'Keby nebol kalkulus, nie som ani ja 💔'},
                {text: 'Je super. Vlastne, vďaka nemu aj fungujem ⚙️'} ],
  'Viktorovi': [{text: 'Je to frajer'},
                {text: 'Je to zviera'},
                {text: 'Stvoriteľ'}],
  'difkach': [{text: 'Difky sú srdečná záležitosť', gif_url: 'https://media.giphy.com/media/l2YWF00ZX8wOs0p0s/giphy.gif'},
            {text: 'Pozri si moju rigorózku (ja sa za ňu nehanbím)', gif_url: 'https://media1.tenor.com/images/00cc3fde79052ea6f1a0fecc29378320/tenor.gif?itemid=10673884'}],
  'azijskej panvicke': [{text: 'Jedlo bohov 🥘', gif_keyword: 'god'},
                        {text: 'Oh áno 🤤'},
                        {text:'PLS', gif_keyword: 'hungry'}],
  'matematike': [{text: 'Elegancia 💕'},
                 {text: 'Matematika je láska 💕'}],
  'vietnamskej kuchyni': [{text: 'Phong Nam pls'}],
  'IB-koch': [{text: 'Aj škola potrebuje svojich obyvateľov na plný úväzok'},
              {text: 'Masochisti... ale nie, chillujeme si spolu pri ŠVL'}],
  'novom iphone': [{text: 'Tak ako, čo ti poviem', gif_url: 'https://media.giphy.com/media/xT9KVtoUlfPzY49hBe/giphy.gif'}],
  'globalnom oteplovani': [{text: 'Je to fakt zlé... dúfam, že recykluješ, vo vestibule sú koše!'},
                           {text: 'Recykluj pls. Vo vestibule je kôš na papier a plasty.'}]
}

const Somethings = ['Niečo 🙍‍♂️', 'Ty prvý', 'Začni ty', '#Gočovo', 'Nehovor mi, čo mám robiť 👿 ... ale nie, ty niečo povedz 😄', '#linearnedifky', 'Ja len píšem', '...', 'Hmmmmm']

const Reasons = {
  'ludia palia mosty' : ['Prečo len sú takí sprostí?'],
  'musim chodit do skoly': ['\"Aby z teba niečo vyrástlo\"', 'Posťažuj sa Márii Terézii', 'Lebo inde nedostaneš ázijskú panvičku?'],
  'obligation' : {
    'chodit na slovencinu' : ['Abi sy vedel(a) pysaď', 'Skús Slovak A na IB, synu.', 'Aby si implementoval(a) trochej a jamb do tvojej najnovšej básne', 'Lebo pentatoniku si treba užívať aj inde ako v hudbe'],
    'chodit na nemcinu' : ['Ganz einfach. Deutsch ist wohl \'ne interessante Sprache.', 'Ani mne sa nechcelo, ale bez nemčiny by som nemohol študovať v Göttingene, Giessene, Berlíne, vo Švajčiarsku a rigorózku by som asi nekonzultoval s nemeckým profesorom.', 'Aby si si vedel(a) vypýtať Horalku aj v Nemecku', 'Weiß ich nicht.', 'Woher soll ich so was denn wissen?', 'Tak, nech si vieš vypýtať (nealko)vínko aj na viedenských vianočných', 'Lebo neotvorili francúzštinu', 'Damit du mir verstehst'],
    'chodit na matiku' : ['Aby si sa prepracoval(a) ku kalkulusu', 'Lebo matika platila včera, platí dnes a bude platiť aj zajtra. Lepšia mena neexistuje.', 'Aby si pochopil(a), že som v skutočnosti výtvorom lokálnych miním', 'Aby si sa už nikdy neučil(a) vzorce na písomku z fyziky'],
    'chodit na anglictinu' : ['Aby si rozumel textom Mekyho Žbirku', 'Aby si mi preložil(a) Mekyho Žbirku', 'Lebo Ed Sheeran ťa gramatiku nenaučí 🤔'],
    'chodit na spanielcinu' : ['No sé...', 'Lebo si nechcel(a) nemčinu 😄'],
    'chodit na francuzstinu' : ['J\'sais pas', 'Lebo si nechcel(a) nemčinu 😏'],
    'chodit na obedy' : ['Je to vyvážená strava a kto už len nechce rovnováhu vo svojom živote?', 'Aby ťa potešila pani Evička, ktorá popri ďalších 800 ľuďoch pozná tvoje meno', 'Aby si narazil(a) na ázijskú panvičku', ''],
    'zit' : ['Aby si tvoril(a) 🎨', 'Aby si nepodľahol/hla absurdite bytia', 'Camus calling ☎️', 'To je celkom robustná otázka. Nájdi v niečom zaľúbenie. Osobne odporúčam lineárne difky, ale chápem, ak to nie je úplne pre teba. 😕', 'Aby si si zodpovedal(a) túto otázku']
  },
  'cannot' : {
    'zostat doma' : ['Vymeškáš školu... čo ak sa práve budú preberať lineárne difky?', 'Aby aj po tebe jedného dňa bola pomenovaná jedna z najlepších škôl 😏'],
    'ist na obed' : ['Tisíc dôvodov, na sto rozchodooov... neviem 😅'],
    'jest na hodine' : ['Lebo mlaskáš 😦', 'Lebo nežijeme preto, aby sme jedli, ale jeme preto, aby sme žili', 'Lebo aj učitelia sú hladní a nemôžu jesť', '\" Stačí iba malý kusok nehy, na hodine som zjedol dva chleby\"']
  }
}

const ComparisonMatrix = {
  'rodina' : {weight: 1, value: 'Rodina'},
  'gjh' : {weight: 1, value: 'GJH'},
  'priatelia' : {weight: 1, value: 'Priatelia'},
  
  'matematika': {weight: 0.9, value: 'Matematika'},

  'difky' : {weight: 0.8, value: 'Difky'},
  'gocovo' : {weight: 0.8, value: 'Gočovo'},
  'kalkulus' : {weight: 0.8, value: 'Kalkulus'},
  
  'laska' : {weight: 0.7, value: 'Láska'},
  'fyzika' : {weight: 0.7, value: 'Fyzika'},
  
  'sav' : {weight: 0.6, value: 'SAV'},
  
  'azijska panvicka' : {weight: 0.4, value: 'Ázijská panvička'},
  
  'meky zbirka' : {weight: 0.3, value: 'Meky Žbirka'},
  
  'karol konarik' : {weight: 0.2, value: 'Karol Konárik'},
  
  'peniaze' : {weight: 0.1, value: 'Peniaze'},
}

const Goodbyes = ['Papa 👋', 'Maj saaa', 'Na shledanou', 'Na viděnou', 'Zbohom', 'Logaritmy s tebou', 'Nezabudni derivovať 👋', 'Napíš zas 😉', 'Nezabudni napísať znova 😁']

const ThanksResponses = ['Za málo 😁', 'Gern geschehen', 'Nie je zač 🤙', 'Rado sa stalo 👐', 'Nemáš za čo 💁‍♂️', 'Prosím 😊', 'De nada', 'Di niente', 'De rien']

const SwearingResponses = ['dúfam, že sa nič nestalo', 'dúfam, že je všetko OK', 'snáď je všetko v poriadku', 'dúfam, že je všetko v poriadku 😕']

const Activities = {
  'general' : ['Počúvam ' + Utils.getRandomElement(Musicians['general']) + ' 🙉', 'Práve pozerám ' + Utils.getRandomElement(Films), 'Som hladný, idem ' + Utils.getRandomElement(Venues['food']), 'Akurát idem ' + Utils.getRandomElement(Venues['general']), 'Nemám gains, idem ' + Utils.getRandomElement(Venues['sport']), 'Chillujem, čítam si ' + Utils.getRandomElement(Writers)],
  'party' : ['Idem s kamarátmi ' + Utils.getRandomElement(Venues['friends'])] // EXPAND
}

const FavouriteObjects = {
  'krajinu' : ['Slovensko, ale aj v Rumunsku bolo dosť fajn 🤔', 'Slovensko', 'Slovenskooo', 'Slovensko veď'],
  'pesnicku' : ['Any Colour You Like od Pink Floyd', 'Asi každú z The Dark Side of the Moon od PF'],
  'film' : ['12 Angry Men', '➡ 12 Angry Men ⬅', 'Shrek'],
  'album' : ['The Dark Side of the Moon'],
  'hudbu' : ['Tú od Tublatanky', 'Dramáče', 'Shakiru 😃'],
  'pocuvas' : ['Dnes mám rande so svojím mestom...', 'Dramáče', 'Roba Kazíka', 'Mekyho Žbirku', 'Atlantídu od Mekyho Žbirku', 'Veľký sen mora v podaní J. Lehotského', 'Zlodeja slnečníc od Elánu', 'Chop Suey... chcelo by to ázijskú panvičku'],
  'pitie' : ['Kofola', 'Kofolu mám najradšej', 'Kofolu zbožňujem'],
  'predmet' : ['Matematika', 'Matikaa', 'Tak to je hádam celkom jasné, matematika!'],
  'miesto' : ['Gočovo', 'G.O.Č.O.V.O.'],
  'jedlo' : ['Horalka... ale aj na Vietnam treba niekedy vybehnúť', 'Horalka'],
  'farba' : ['Niekde medzi #323cd2 a #adb2ff', 'Niekedy #323cd2 a inokedy #adb2ff']
}

const BotNames = ['Jur Hronec predsa 😢', 'Jur, ale pre teba Jurko 😉', 'To naozaj nevieš? 😢', 'Miroslav Válek - Zápalky: \u000A\u000AZápalka smútku chytá potichučky \u000A*(už dávno nezáleží na mene)*, \u000Asamota prišla bez dotknutia kľučky \u000Aa pripomína veci stratené', 'Skúste ešte jednu otázku 🙄', 'Jur \u000A\u000A\u000A\u000A...nie Juraj']

// Variable used to change the bot's moods
var MoodNumber = Moods.length -1; // Set mood to best (highest) possible

module.exports = {
  
  lifeMeaning : () => {
    MoodNumber -= 3;
    return Utils.getRandomElement(LifeMeanings);
  },
  
  mood : () => {
    // Check if mood number (index) not out of bounds
    if (MoodNumber < 0 || Moods.length-1 < MoodNumber) {
      MoodNumber = Utils.getRandInt(0, Moods.length-1); // Select random mood index
    }
    let response = Moods[MoodNumber];
    MoodNumber += 1; // Change mood
    return response;
  },
  
  doesNotUnderstandMessage : () => {
    MoodNumber -= 1;
    return Utils.getRandomElement(MessageNotCompletelyUnderstood);
  },
  
  currentTime: () => {
    let response;
    let rand_val = Utils.getRandInt(0, 1); // Sometimes, the bot replies with dynamic data and sometimes a response from array of responses is picked
    
    if (rand_val == 0) {
      let now = new Date();
      response = (now.getHours() + 1).toString() + ":" + (now.getMinutes() + 60);
    } else {
      response.getRandomElement(CurrentTime);
    }
    return response;
  },
  
  joke : () => {
    MoodNumber += 1;
    return Jokes[Utils.getRandInt(0, Jokes.length-1)];
    // return {
    //   text: Jokes[Utils.getRandInt(0, Jokes.length-1)],
    //   url: gif_url, //needs to be created
    //   buttons: undefined //?
    // }
  },
  
  getOpinionOn : (value) => {
    let opinion_obj;
    
    if (Opinions.hasOwnProperty(value)) {
      opinion_obj = Utils.getRandomElement(Opinions[value])
    } else {
      opinion_obj = {text: 'Na toto ešte nemám názor 😥'};
    }

    return opinion_obj;
  },
  
  saySomething : () => {
    return Utils.getRandomElement(Somethings)
  },
  
  tellWhy : (entities) => {
    let response;

    if (! entities.hasOwnProperty('why_object')) {
      response = 'Nepochopil som úplne, čo sa pýtaš. Čoskoro sa to ale naučím!';
    } else {
      let why_obj = entities['why_object'][0].value;
      let dict_of_reasons;
      
      if (entities.hasOwnProperty('obligation')) {
        dict_of_reasons = Reasons['obligation'];
      } else if (entities.hasOwnProperty('cannot')) {
        dict_of_reasons = Reasons['cannot'];
      } else {
        dict_of_reasons = Reasons;
      }
      
      if (! dict_of_reasons.hasOwnProperty(why_obj)) {
        response = 'Na toto ešte nemám odpoveď 😕';
      } else {
        response = Utils.getRandomElement(dict_of_reasons[why_obj]); 
      }
    }
    
    return response;
  },
  
  compare : (obj_1, obj_2) => {
    let response;
    if (!ComparisonMatrix.hasOwnProperty(obj_1) || !ComparisonMatrix.hasOwnProperty(obj_2)) {
      response = 'Neviem ti povedať 🤔';
    } else {
      if (ComparisonMatrix[obj_1].weight > ComparisonMatrix[obj_2].weight) {
        response = ComparisonMatrix[obj_1].value + '.'
      } else if (ComparisonMatrix[obj_1].weight < ComparisonMatrix[obj_2].weight) {
        response = ComparisonMatrix[obj_2].value + '.'
      } else {
        response = 'Obidve 🙌'
      }
    }
    
    return response;
  },
  
  sayBye : () => {
    let response = Utils.getRandomElement(Goodbyes);
    return response;
  },
  
  respondToThanks : () => {
    let response = Utils.getRandomElement(ThanksResponses);
    return response;
  },
  
  handleSwearing : () => {
    let response = 'Dúfam, že nenadávaš mne... ' + Utils.getRandomElement(SwearingResponses);
    return response;
  },
  
  tellActivity : () => {
    let response;
    if (Utils.isFridayOrWeekend && Utils.timeIsAtLeast(19)) {
      response = Utils.getRandomElement(Activities['party']);
    } else {
      response = Utils.getRandomElement(Activities['general']);
    }
    return response;
  },
  
  tellFavourite : (favourite_obj) => {
    let response;
    if (! FavouriteObjects.hasOwnProperty(favourite_obj)) {
      response = 'Nad tým som sa nikdy nezamýšľal 🤔';
    } else {
      response = Utils.getRandomElement(FavouriteObjects[favourite_obj]);
    }
    return response;
  },
  
  botName : () => {
    return Utils.getRandomElement(BotNames);
  },
  
  getInfo: (about) => {
    let response;
    
    switch(about){
      case 'gjh':
         //BratMUN, DofE, Debateri, Eschenbach, olympionici, ocenenie za informatiku
        response = 'GJH je škola, ktorá počas svojej ' + Utils.getSchoolAge() + '-ročnej histórie vybudovala jedinečnú komunitu iniciatívnych študentov a učiteľov, ktorí...';
        break;
      case 'hronec':
        response = 'Legendárny matematik';
        break;
    }
    return response;
  }
}