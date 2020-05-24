module.exports = {
  url : {
    maps : {
      parkingLot : 'https://www.google.com/maps/search/?api=1&query=48.146035,17.135016',
      schoolDirections : 'https://www.google.com/maps/dir/?api=1&destination=Spojen%C3%A1+%C5%A1kola+Novohradsk%C3%A1%2C+Novohradsk%C3%A1+3%2C+821+09+Ru%C5%BEinov',
    },
    test : {
      maths : 'https://www.gjh.sk/o-skole/predmety/matematika',
      slovak : 'https://www.gjh.sk/sj/subs/prijmacie-testy.php',
    },
    moreAboutApplication : 'https://www.gjh.sk/o-skole/pre-zaujemcov-o-studium',
    nadaciaNovohradskaTwoPercent : 'https://gjh.sk/o-skole/nadacia-novohradska#chapter3',
    nadaciaNovohradskaAnyContribution : 'https://gjh.sk/o-skole/nadacia-novohradska#chapter7',
    eduPageLogin : 'https://ssnovohradska.edupage.org/login/',
    eduPageParentLogin : 'https://gjh.sk/rodicia/prístup-na-edupage/181218Ako_vytvorit_rodicovske_konto_na_Edupage.pdf',
    moreAboutLunches : 'https://www.gjh.sk/informacie/pre-stravnikov',
    eduPageAppLink : {
      iOS: 'http://appstore.com/edupage',
      Android: 'https://play.google.com/store/search?q=edupage&c=apps'
    }   
  },
  
  date : {
    schoolEstablished : new Date(1959, 9, 1),
    jurHronecBirthdate : new Date(1881, 5, 17),
    weekdaysSK : ["pondelok", "utorok", "streda", "stvrtok", "piatok", "sobota", "nedela"]
  },
  
  lunch : {
    dictionary : {
      drink: '🥤',
      side: '🍟',
      salad: '🥦',
      main: '🍛',
      soup: '🍜',
      extra: '✨'
    }
  },
  
  time : {
    everyHour : 3600 * 1000,
    everyWeek : 168 * (3600 * 1000),
    everyDay : 24 * (3600 * 1000)
  },
  
  directions : {
    schoolSides : {
      "Z": 'základnej školy 🚠',
      "G": 'gymnázia 🚠'
    },
    fromStairs : {
      "L": 'zaboč doľava ⬅️',
      "S": 'choď rovno ⬆️',
      "R": 'zaboč doprava ➡️'
    },
    afterStairs : {
      "L": 'na ľavej strane chodby 🚪',
      "S": 'pred sebou 🚪',
      "R": 'na pravej strane chodby 🚪',
      "E": 'na konci chodby 🚪'
    }
  }
}