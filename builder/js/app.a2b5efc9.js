(function(t){function e(e){for(var a,r,o=e[0],l=e[1],c=e[2],p=0,v=[];p<o.length;p++)r=o[p],Object.prototype.hasOwnProperty.call(n,r)&&n[r]&&v.push(n[r][0]),n[r]=0;for(a in l)Object.prototype.hasOwnProperty.call(l,a)&&(t[a]=l[a]);u&&u(e);while(v.length)v.shift()();return i.push.apply(i,c||[]),s()}function s(){for(var t,e=0;e<i.length;e++){for(var s=i[e],a=!0,o=1;o<s.length;o++){var l=s[o];0!==n[l]&&(a=!1)}a&&(i.splice(e--,1),t=r(r.s=s[0]))}return t}var a={},n={app:0},i=[];function r(e){if(a[e])return a[e].exports;var s=a[e]={i:e,l:!1,exports:{}};return t[e].call(s.exports,s,s.exports,r),s.l=!0,s.exports}r.m=t,r.c=a,r.d=function(t,e,s){r.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:s})},r.r=function(t){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},r.t=function(t,e){if(1&e&&(t=r(t)),8&e)return t;if(4&e&&"object"===typeof t&&t&&t.__esModule)return t;var s=Object.create(null);if(r.r(s),Object.defineProperty(s,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var a in t)r.d(s,a,function(e){return t[e]}.bind(null,a));return s},r.n=function(t){var e=t&&t.__esModule?function(){return t["default"]}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="/";var o=window["webpackJsonp"]=window["webpackJsonp"]||[],l=o.push.bind(o);o.push=e,o=o.slice();for(var c=0;c<o.length;c++)e(o[c]);var u=l;i.push([0,"chunk-vendors"]),s()})({0:function(t,e,s){t.exports=s("56d7")},"06d8":function(t,e,s){"use strict";var a=s("7020"),n=s.n(a);n.a},"12cd":function(t,e,s){},"27cf":function(t,e,s){},"344f":function(t,e,s){},4113:function(t,e,s){},"56d7":function(t,e,s){"use strict";s.r(e);var a=s("2b0e"),n=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("v-app",{attrs:{id:"root"}},[s("Alerts"),s("v-container",{staticClass:"pa-2 d-flex align-stretch",staticStyle:{height:"100%"},attrs:{fluid:""}},[s("v-row",[s("v-col",{staticClass:"pa-0",attrs:{cols:"8"}},[s("v-row",[s("v-col",[s("Search")],1)],1),s("v-row",[s("v-col",{staticClass:"pt-0 pb-0"},[s("v-carousel",{staticStyle:{"max-height":"100%"},attrs:{"hide-delimiters":"","show-arrows":!1,height:"100%",light:""},model:{value:t.currentResponse,callback:function(e){t.currentResponse=e},expression:"currentResponse"}},t._l(t.responses,(function(e,a){return s("Answer",{key:e.key,attrs:{breadCrumbs:t.breadCrumbs,index:a,name:t.names[a],isIntent:0===a}})})),1)],1)],1)],1),s("v-col",{staticClass:"pa-2 d-flex align-stretch",attrs:{cols:"4"}},[s("b-bar",{on:{addResponse:t.addResponse}})],1)],1)],1)],1)},i=[],r=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("v-card",{staticClass:"pa-5 align-self-stretch",attrs:{width:"100%"}},[s("v-row",{attrs:{dense:""}},[s("v-col",{staticClass:"pa-0",attrs:{lg:"5"}},[s("h3",[t._v("Zvoľ si akú odpoveď chceš editovať")])]),s("v-col",{attrs:{lg:"5"}},[s("v-autocomplete",{attrs:{spellcheck:"false",dense:"",color:"#BCE4FA",items:t.options,label:"Názov intentu"},on:{change:t.selectIntent},model:{value:t.current,callback:function(e){t.current=e},expression:"current"}})],1)],1),s("v-row",{attrs:{dense:""}},[s("v-col",{staticClass:"pa-0"},[s("p",[t._v("Napíš názov "),s("b",[t._v("intent")]),t._v("-u ktorý si mu pridelil(a)")])])],1)],1)},o=[],l=(s("6dfc"),s("bc3a")),c=s.n(l),u={getIntents(){return new Promise((t,e)=>{c.a.post("/api",{request:"intents"}).then(e=>{let s=e.data;t(s)})})}};const p=new a["default"];var v={data(){return{options:[],current:""}},methods:{},created(){u.getIntents().then(t=>{this.options=t,this.current=t[0],this.selectIntent(this.current)})},methods:{selectIntent(t){p.$emit("loadIntent",t)}}},h=v,d=s("2877"),m=Object(d["a"])(h,r,o,!1,null,"17b9ac22",null),b=m.exports,f=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("v-card",{staticClass:"pl-5 pr-5"},[s("v-row",[s("h3",[t._v("Skladač správ")])]),s("v-row",[s("p",[t._v("Tu si zvoľ, akú odpoveď má Ďurko na daný "),s("b",[t._v("intent")]),t._v(" odpísať. Jednoducho klikni na žiadaný typ správy a zobrazí sa ti v odpovedi")])]),s("v-row",[s("div",{staticClass:"response text"},[s("div",{staticClass:"bubble click",on:{click:function(e){return t.pipeType("text")}}},[t._v("Klasická textová správa vhodná na rýchlu a jednoduchú odpoveď")]),s("div",{staticClass:"description"},[t._v("Textová správa")])])]),s("v-row",[s("div",{staticClass:"response wait"},[s("WaitIcon",{staticClass:"wait-icon click",on:{click:function(e){return t.pipeType("wait")}}}),s("div",{staticClass:"description"},[t._v("Dramatická pauza")])],1)]),s("v-row",[s("div",{staticClass:"response url"},[s("div",{staticClass:"button click",on:{click:function(e){return t.pipeType("url")}}},[t._v(" Zoberem ťa do Infoportalu ")]),s("div",{staticClass:"description"},[t._v("Webová stránka")])])]),s("v-row",[s("div",{staticClass:"response quick-responses"},[s("div",{staticClass:"bubbles-wrapper click",on:{click:function(e){return t.pipeType("quicks")}}},[s("div",{staticClass:"bubbles"},[t._v(" Dovolenka ")]),s("div",{staticClass:"bubbles center"},[t._v(" Sviatky ")]),s("div",{staticClass:"bubbles"},[t._v(" Sabatikal ")])]),s("div",{staticClass:"description"},[t._v("Rýchle odpovede")])])])],1)},g=[],k=s("6661"),_=s.n(k),y={data(){return{options:[]}},components:{WaitIcon:_.a},methods:{pipeType(t){this.$emit("addResponse",t)}},created(){}},w=y,x=(s("723f"),Object(d["a"])(w,f,g,!1,null,"21a4e95e",null)),C=x.exports,$=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("v-carousel-item",{attrs:{"reverse-transition":"scale-transition",transition:"scale-transition"}},[s("v-card",{ref:"answerView:"+t.breadCrumbs,staticClass:"pl-5 pt-5 pb-0 pr-5 align-self-stretch",attrs:{width:"100%",elevation:"2",height:"100%"}},[s("v-row",{attrs:{dense:"","no-gutters":""}},[s("v-col",{attrs:{lg:"3"}},[s("h3",[t._v(" Odpoveď na ")])]),s("v-col",{attrs:{lg:"6"}},[s("v-row",[s("v-col",{staticClass:"pt-2"},t._l(t.breadCrumbs,(function(e,a){return s("div",{key:a+1,staticStyle:{display:"inline"}},[a<t.breadCrumbs.length-1?s("a",{staticClass:"active-link",on:{click:function(e){return t.redirect(a)}}},[t._v(" "+t._s(e)+" ")]):t._e(),a===t.breadCrumbs.length-1?s("a",{staticClass:"passive-link",on:{click:function(e){return t.redirect(-1)}}},[t._v(" "+t._s(e)+" ")]):t._e(),s("span",[t._v("/")])])})),0)],1)],1),s("v-spacer"),s("v-col",{staticClass:"pt-4",attrs:{lg:"2"}},[s("v-btn",{attrs:{color:"blue",outlined:"",text:""},on:{click:function(e){return t.saveResponse()}}},[t._v("Uložiť")])],1)],1),s("v-row",{attrs:{dense:"","no-gutters":""}},[s("v-col",[s("p",[t._v(" Takto nejako bude tvoja odpoveď vyzerať ")])])],1),s("v-row",{attrs:{justify:"center"}},[s("v-dialog",{attrs:{"max-width":"800"},model:{value:t.dialog,callback:function(e){t.dialog=e},expression:"dialog"}},[s(t.currentMsg.type+"-editor",{ref:"Dialog",tag:"component",attrs:{name:t.name},on:{closeDialog:t.closeDialog,removePostback:t.removePostback}})],1)],1),s("div",{ref:"Cap",staticClass:"cap"},t._l(t.response,(function(e,a){return s("v-row",{key:e.key,staticClass:"item-wrapper pa-2 d-flex align-stretch",attrs:{dense:"","no-gutters":"",justify:"center",tag:"div"}},[s("v-col",{attrs:{cols:"4"}},[s(t.typeToComponent(e.type),{tag:"component",staticClass:"item",attrs:{msg:e},nativeOn:{click:function(s){return s.stopPropagation(),t.displayDialog(e,a)}}})],1),s("v-col",{attrs:{cols:"1"}},[s("v-btn",{attrs:{icon:"",color:"black"},on:{click:function(e){return t.removeElement(a)}}},[s("v-icon",{attrs:{dark:""}},[t._v("mdi-delete")])],1)],1)],1)})),1)],1)],1)},B=[],j=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{staticClass:"text-response"},[t._v(" "+t._s(t.msg.value)+" ")])},D=[],P={props:["msg"]},O=P,q=(s("6cb4"),Object(d["a"])(O,j,D,!1,null,"7b438172",null)),R=q.exports,I=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{staticClass:"wait"},[s("WaitIcon",{staticClass:"icon"}),s("div",{staticClass:"description"},[t._v("Pauza na "+t._s(t.msg.value)+" ms")])],1)},S=[],T={props:["msg"],components:{WaitIcon:_.a}},z=T,E=(s("06d8"),Object(d["a"])(z,I,S,!1,null,"602f1602",null)),M=E.exports,N=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{staticClass:"url"},[s("div",{staticClass:"text-response"},[t._v(" "+t._s(t.msg.value)+" ")]),s("v-tooltip",{attrs:{right:""},scopedSlots:t._u([{key:"activator",fn:function(e){var a=e.on,n=e.attrs;return[s("div",t._g(t._b({staticClass:"button click"},"div",n,!1),a),[t._v(" "+t._s(t.msg.options.title)+" ")])]}}])},[s("span",[t._v(t._s(t.msg.options.url))])])],1)},F=[],A={props:["msg"]},L=A,U=(s("7ce3"),Object(d["a"])(L,N,F,!1,null,"4051fae6",null)),Q=U.exports,Z=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{staticClass:"quick"},[s("div",{staticClass:"text-response"},[t._v(" "+t._s(t.msg.value)+" ")]),t._l(t.msg.options,(function(e){return s("div",{key:e.post_back,staticClass:"button"},[t._v(" "+t._s(e.title)+" ")])}))],2)},W=[],J={props:["msg"]},K=J,V=(s("e754"),Object(d["a"])(K,Z,W,!1,null,"a4107dd6",null)),G=V.exports,H=s("bf37"),X=s.n(H);const Y="http://localhost:1337";class tt{constructor(){}save(t,e){return new Promise((s,a)=>{let n=this.backend(t,e);n.request="save",c.a.post(this.url("responses"),n).then(()=>{console.log("saved"),s()})})}load(t){return new Promise((e,s)=>{let a={request:"load",name:t};c.a.post(this.url("responses"),a).then(t=>{e(this.serializeBackend(t.data))})})}removePostback(t){return new Promise((e,s)=>{let a={request:"remove",names:t};c.a.post(this.url("responses"),a).then(()=>{e()})})}serializeFrontend(t){let e=[];for(let s=0;s<t.length;++s){let a,n=t[s],i={value:n.value};switch(n.type){case"quicks":i.type="buttons",a=[],n.options.forEach(t=>{a.push({title:t.title,type:"postback",payload:t.post_back})}),i.options={btns:a};break;case"url":i.type="buttons",a=[],a.push({title:n.options.title,type:"web_url",url:n.options.url}),i.options={btns:a};break;case"text":i.type="text";break;case"wait":i.type="wait";break}e.push(i)}return JSON.stringify(e)}serializeBackend(t){let e=[];for(let s=0;s<t.length;++s){let a=t[s],n={value:a.value};switch(a.type){case"buttons":let t=a.options.btns;if("postback"===t[0].type){n.type="quicks";let e=[];t.forEach(t=>{e.push({title:t.title,post_back:t.payload})}),n.options=e}else{n.type="url";let e={title:t[0].title,url:t[0].url};n.options=e}break;case"text":n.type="text";break;case"wait":n.type="wait";break}e.push(n)}return e}url(t){return`${Y}/${t}`}backend(t,e){let s={name:t,isIntent:1===t.split(":").length,response:this.serializeFrontend(e)},a={payload:s,request:""};return a}}const et=new tt;class st{constructor(t){this.name=t}translate(t){return`${t}:${this.name}`}$on(t,e){let s=this.translate(t);p.$on(s,e)}$emit(t,e){let s=this.translate(t);p.$emit(s,e)}$off(t,e){let s=this.translate(t);p.$off(s,e)}}var at=st,nt=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("v-card",[s("v-card-title",[s("span",{staticClass:"headline"},[t._v("Textová správa")])]),s("v-card-text",[s("v-container",[s("v-row",[s("v-text-field",{attrs:{label:"Správa",hint:"Nepíš nič dlhé","persistent-hint":"",required:"",spellcheck:"false"},model:{value:t.value,callback:function(e){t.value=e},expression:"value"}})],1)],1)],1),s("v-card-actions",[s("v-spacer"),s("v-btn",{staticClass:"ma-2",attrs:{outlined:"",color:"red",text:""},on:{click:function(e){return t.closeDialog(!1)}}},[t._v("Zrušiť")]),s("v-btn",{staticClass:"ma-2",attrs:{color:"blue",outlined:"",text:""},on:{click:function(e){return t.closeDialog(!0)}}},[t._v("Uložiť")])],1)],1)},it=[],rt={data(){return{value:""}},methods:{closeDialog(t){t&&(this.msg.value=this.value),this.$emit("closeDialog",this.msg),this.value=""},display(t){this.value=t.value,this.msg=t}}},ot=rt,lt=Object(d["a"])(ot,nt,it,!1,null,null,null),ct=lt.exports,ut=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("v-card",[s("v-card-title",[s("span",{staticClass:"headline"},[t._v("Dramatická pauza")])]),s("v-card-text",[s("v-container",[s("v-row",[s("v-text-field",{attrs:{label:"Pauza ms",hint:"Ďurko chvíľku počká","persistent-hint":"",required:"",spellcheck:"false"},model:{value:t.value,callback:function(e){t.value=e},expression:"value"}})],1)],1)],1),s("v-card-actions",[s("v-spacer"),s("v-btn",{staticClass:"ma-2",attrs:{outlined:"",color:"red",text:""},on:{click:function(e){return t.closeDialog(!1)}}},[t._v("Zrušiť")]),s("v-btn",{staticClass:"ma-2",attrs:{color:"blue",outlined:"",text:""},on:{click:function(e){return t.closeDialog(!0)}}},[t._v("Uložiť")])],1)],1)},pt=[],vt={data(){return{value:0}},methods:{closeDialog(t){t&&(this.msg.value=this.value),this.$emit("closeDialog",this.msg),this.value=0},display(t){this.value=t.value,this.msg=t}}},ht=vt,dt=Object(d["a"])(ht,ut,pt,!1,null,null,null),mt=dt.exports,bt=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("v-card",[s("v-card-title",[s("span",{staticClass:"headline"},[t._v("Webový odkaz")])]),s("v-card-text",[s("v-container",[s("v-row",[s("v-col",{attrs:{lg:"12"}},[s("v-text-field",{attrs:{label:"Úvodná správa",hint:"Text kde vysvetlíš o čo ide","persistent-hint":"",required:"",spellcheck:"false"},model:{value:t.value,callback:function(e){t.value=e},expression:"value"}})],1)],1),s("v-row",[s("v-col",{attrs:{lg:"8"}},[s("v-text-field",{attrs:{label:"URL",hint:"URL, kam bude užívateľ presmerovaný","persistent-hint":"",required:"",spellcheck:"false"},model:{value:t.url,callback:function(e){t.url=e},expression:"url"}})],1),s("v-col",{attrs:{lg:"4"}},[s("v-text-field",{attrs:{label:"Text na tlačítku",required:"",spellcheck:"false"},model:{value:t.title,callback:function(e){t.title=e},expression:"title"}})],1)],1)],1)],1),s("v-card-actions",[s("v-spacer"),s("v-btn",{staticClass:"ma-2",attrs:{outlined:"",color:"red",text:""},on:{click:function(e){return t.closeDialog(!1)}}},[t._v("Zrušiť")]),s("v-btn",{staticClass:"ma-2",attrs:{color:"blue",outlined:"",text:""},on:{click:function(e){return t.closeDialog(!0)}}},[t._v("Uložiť")])],1)],1)},ft=[],gt={data(){return{value:"",url:"",title:""}},props:["name"],created(){this.pBus=new PBus(this.name)},methods:{closeDialog(t){t&&(this.msg.value=this.value,this.msg.options.url=this.url,this.msg.options.title=this.title),this.$emit("closeDialog",this.msg),this.value="",this.url="",this.title=""},display(t){this.value=t.value,this.url=t.options.url,this.title=t.options.title,this.msg=t}}},kt=gt,_t=Object(d["a"])(kt,bt,ft,!1,null,null,null),yt=_t.exports,wt=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("v-card",[s("v-card-title",[s("span",{staticClass:"headline"},[t._v("Rýchle odpovede")])]),s("v-card-text",[s("v-container",[s("v-row",[s("v-col",[s("v-text-field",{attrs:{label:"Úvodná správa",hint:"Text, kde sa spýtaš otázku","persistent-hint":"",required:"",spellcheck:"false"},model:{value:t.value,callback:function(e){t.value=e},expression:"value"}})],1)],1),s("v-row",{staticClass:"justify-center",attrs:{lg:"12"}},[t._l(t.btns,(function(e,a){return s("v-col",{key:e.post_back,staticClass:"ma-4",attrs:{lg:"3"}},[s("v-row",[s("v-text-field",{attrs:{label:"Text odpovede",required:"",spellcheck:"false"},model:{value:e.title,callback:function(s){t.$set(e,"title",s)},expression:"btn.title"}})],1),s("v-row",[s("v-btn",{attrs:{color:"blue",width:"190",outlined:""},on:{click:function(s){return t.editQuick(e)}}},[t._v("Upraviť reakciu")])],1),a>0?s("v-row",{staticClass:"mt-2"},[s("v-btn",{attrs:{width:"190",outlined:"",color:"red",text:""},on:{click:function(e){return t.remove(a)}}},[t._v("Zmazať reakciu")])],1):t._e()],1)})),s("v-col",{attrs:{lg:"3","justify-center":"","align-center":""}},[s("v-row",{attrs:{"fill-height":""}},[s("v-btn",{staticClass:"ma-12",attrs:{color:"blue",outlined:""},on:{click:t.addQuick}},[s("v-icon",{attrs:{color:"blue"}},[t._v("mdi-plus")])],1)],1)],1)],2)],1)],1),s("v-card-actions",[s("v-spacer"),s("v-btn",{staticClass:"ma-2",attrs:{outlined:"",color:"red",text:""},on:{click:function(e){return t.closeDialog(!1)}}},[t._v("Zrušiť")]),s("v-btn",{staticClass:"ma-2",attrs:{color:"blue",outlined:"",text:""},on:{click:function(e){return t.closeDialog(!0)}}},[t._v("Uložiť")])],1)],1)},xt=[],Ct={data(){return{value:"",btns:[],msg:{},pBus:null}},props:["name"],created(){this.pBus=new at(this.name)},methods:{closeDialog(t){t&&(this.msg.value=this.value,this.msg.options=this.btns,this.pBus.$emit("emptyBin")),this.$emit("closeDialog",this.msg),this.value="",this.btns=[]},copyButtons(t){let e=[];return t.forEach(t=>{e.push({title:t.title,post_back:t.post_back})}),e},display(t){this.value=t.value,this.btns=this.copyButtons(t.options),this.msg=t},remove(t){let e=this.btns.splice(t,1)[0];this.$emit("removePostback",e.post_back)},addQuick(){this.btns.push({title:"Možnosť "+(this.btns.length+1),post_back:"option_"+this.btns.length})},editQuick(t){this.msg.value=this.value,this.msg.options=this.btns,this.pBus.$emit("saveQuicks",this.msg),this.pBus.$emit("pauseDialog"),p.$emit("openPostBack",t)}}},$t=Ct,Bt=Object(d["a"])($t,wt,xt,!1,null,null,null),jt=Bt.exports;function Dt(t){var e="";while(e.length<t)e+=Math.random().toString(16).substring(2);return e.substring(0,t)}var Pt={props:["index","isIntent","name","parent","breadCrumbs"],data(){return{response:[],dialog:!1,currentMsg:{},currentIndex:-1,pausedDialog:!1,pBus:null,saved:!0,removePostbacks:[]}},created(){this.pBus=new at(this.name),this.isIntent||(this.parentPBus=new at(this.parent)),this.loadResponse(),this.pBus.$on("pauseDialog",this.pauseDialog),this.pBus.$on("newType",this.addResponse),this.pBus.$on("resume",this.resume),this.pBus.$on("emptyBin",this.emptyPostbacksBin),this.pBus.$on("saveQuicks",this.quickSave)},mounted(){},components:{"text-comp":R,"wait-comp":M,"url-comp":Q,"quicks-comp":G,"close-icon":X.a,"text-editor":ct,"wait-editor":mt,"url-editor":yt,"quicks-editor":jt},beforeDestroy(){this.pBus.$off("pauseDialog",this.pauseDialog),this.pBus.$off("newType",this.addResponse),this.pBus.$off("resume",this.resume),this.pBus.$off("emptyBin",this.emptyPostbacksBin),this.pBus.$off("saveQuicks",this.quickSave)},methods:{redirect(t){if(-1===t)return;let e=!0;this.saved||(e=window.confirm("Naozaj chceš odísť? Máš tu ešte neuložené zmeny")),e&&p.$emit("redirect",t)},loadResponse(){et.load(this.name).then(t=>{this.response=t})},pauseDialog(){this.dialog=!1,this.pauseDialog=!0},resume(t){t&&this.pauseDialog&&(this.dialog=!0),this.pauseDialog=!1},emptyPostbacksBin(){this.removePostbacks.forEach(t=>{et.removePostback(t)}),this.removePostbacks=[]},quickSave(t){this.$set(this.response,this.currentIndex,t),et.save(this.name,this.response).then(()=>{this.saved=!0})},saveResponse(){this.emptyPostbacksBin(),et.save(this.name,this.response).then(()=>{this.saved=!0,this.isIntent?p.$emit("alert",{type:"success",msg:"Intent bol uložený"}):(p.$emit("alert",{type:"success",msg:"Odpoveď bola uložená"}),p.$emit("removeLast"))})},typeToComponent(t){return t+"-comp"},displayDialog(t,e){this.currentMsg=t,this.currentIndex=e,this.dialog=!0,this.$nextTick(()=>{this.$refs.Dialog.display(this.currentMsg)})},closeDialog(t){this.dialog=!1,this.$set(this.response,this.currentIndex,t)},formNextName(t){return`${this.name}:${t}`},removePostback(t){this.removePostbacks.push(this.formNextName(t))},removeElement(t){this.saved=!1;let e=this.response.splice(t,1)[0];"quicks"===e.type&&e.options.forEach(t=>{this.removePostbacks.push(this.formNextName(t.post_back))})},addResponse(t){let e=this.response[this.response.length-1];if(e&&"quicks"===e.type)return void p.$emit("alert",{type:"error",msg:"Rýchle odpovede musia byť ako posledný prvok správy"});this.saved=!1;let s={type:t,key:Dt(5)};switch(t){case"wait":s.value=500;break;case"url":s.value="Viac info nájdeš na tejto stránke",s.options={url:"URL adresa",title:"Klikni na mňa"};break;case"text":s.value="Klikni na mňa aby si ma upravil(a)";break;case"quicks":s.value="Tvoja naj farba je?",s.options=[{title:"Možnosť 1",post_back:"option_0"}];break}this.response.push(s)}}},Ot=Pt,qt=(s("f903"),Object(d["a"])(Ot,$,B,!1,null,"ffe9c6f4",null)),Rt=qt.exports,It=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("v-container",{staticClass:"alerts"},t._l(t.alerts,(function(e){return s("v-alert",{key:e.key,attrs:{type:e.type,transition:"scale-transition",value:e.value,elevation:"2","colored-border":"",dismissible:"",border:"left"}},[t._v(" "+t._s(e.msg)+" ")])})),1)},St=[];function Tt(t){var e="";while(e.length<t)e+=Math.random().toString(16).substring(2);return e.substring(0,t)}var zt={data(){return{alerts:[]}},created(){p.$on("alert",t=>{t.key=Tt(5),t.value=!0,this.alerts.push(t);const e=this;window.setTimeout(()=>{for(let s=0;s<e.alerts.length;s++)if(t.key==e.alerts[s].key)return e.alerts[s].value=!1,void e.alerts.splice(s,1)},5e3)})}},Et=zt,Mt=(s("6101"),Object(d["a"])(Et,It,St,!1,null,"17aa2f5d",null)),Nt=Mt.exports;function Ft(t){var e="";while(e.length<t)e+=Math.random().toString(16).substring(2);return e.substring(0,t)}var At={name:"App",components:{Search:b,"b-bar":C,Answer:Rt,Alerts:Nt},created(){p.$on("loadIntent",t=>{this.responses=[],this.names=[],this.breadCrumbs=[],this.responses.push({value:t,key:Ft(5)}),this.breadCrumbs.push(t),this.pBuses.push(new at(t)),this.names.push(this.generateName(0)),this.currentResponse=0}),p.$on("redirect",t=>{let e=this.responses.length-1-t;this.responses.splice(t+1,e),this.names.splice(t+1,e),this.breadCrumbs.splice(t+1,e),this.pBuses.splice(t+1,e),this.currentResponse=t,this.pBuses[this.pBuses.length-1].$emit("resume",!0)}),p.$on("removeLast",()=>{this.responses.length;this.responses.pop(),this.names.pop(),this.breadCrumbs.pop(),this.pBuses.pop(),this.currentResponse--,this.pBuses[this.pBuses.length-1].$emit("resume",!0)}),p.$on("openPostBack",t=>{this.nextId++;let e=t.title,s=t.post_back;this.responses.push({value:s,key:Ft(5)}),this.names.push(this.generateName(this.responses.length-1)),this.breadCrumbs.push(e),this.pBuses.push(new at(this.names[this.names.length-1])),this.currentResponse++})},data:()=>({currentResponse:0,responses:[],breadCrumbs:[],names:[],pBuses:[],screens:[],nextId:0}),methods:{addResponse(t){let e=this.pBuses[this.pBuses.length-1];e.$emit("newType",t)},generateName(t){let e="";for(let s=0;s<=t;++s)e+=this.responses[s].value,s<t&&(e+=":");return e}}},Lt=At,Ut=(s("5c0b"),Object(d["a"])(Lt,n,i,!1,null,null,null)),Qt=Ut.exports,Zt=s("ce5b"),Wt=s.n(Zt);s("bf40");a["default"].use(Wt.a);var Jt=new Wt.a({theme:{themes:{light:{primary:"#ee44aa",secondary:"#424242",accent:"#82B1FF",error:"#FF5252",info:"#2196F3",success:"#4CAF50",warning:"#FFC107"}}}});s("d5e8"),s("5363");a["default"].config.productionTip=!1,new a["default"]({vuetify:Jt,render:t=>t(Qt)}).$mount("#app")},"5c0b":function(t,e,s){"use strict";var a=s("9c0c"),n=s.n(a);n.a},6101:function(t,e,s){"use strict";var a=s("bfc3"),n=s.n(a);n.a},6661:function(t,e){t.exports={functional:!0,render(t,e){const{_c:s,_v:a,data:n,children:i=[]}=e,{class:r,staticClass:o,style:l,staticStyle:c,attrs:u={},...p}=n;return s("svg",{class:[r,o],style:[l,c],attrs:Object.assign({xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 496 496"},u),...p},i.concat([s("path",{attrs:{d:"M423.36 72.635A248 248 0 00247.995 0a8 8 0 00-8 8v64a8 8 0 0016 0V16.136c128.054 4.416 228.282 111.805 223.866 239.859-4.416 128.054-111.805 228.282-239.859 223.866C111.948 475.444 11.72 368.055 16.136 240.002A231.993 231.993 0 0183.947 83.953a8 8 0 00-11.312-11.312c-96.849 96.851-96.846 253.876.005 350.725s253.876 96.846 350.725-.005 96.846-253.877-.005-350.726z"}}),s("path",{attrs:{d:"M247.995 216a31.573 31.573 0 00-16.152 4.536l-113.96-113.96a8 8 0 00-11.312 11.312l113.96 113.96A31.573 31.573 0 00215.995 248c0 17.673 14.327 32 32 32 17.673 0 32-14.327 32-32s-14.327-32-32-32zm0 48c-8.837 0-16-7.163-16-16s7.163-16 16-16 16 7.163 16 16-7.163 16-16 16z"}})]))}}},"6cb4":function(t,e,s){"use strict";var a=s("27cf"),n=s.n(a);n.a},"6d82":function(t,e,s){},7020:function(t,e,s){},"723f":function(t,e,s){"use strict";var a=s("6d82"),n=s.n(a);n.a},"7ce3":function(t,e,s){"use strict";var a=s("4113"),n=s.n(a);n.a},"9c0c":function(t,e,s){},bf37:function(t,e){t.exports={functional:!0,render(t,e){const{_c:s,_v:a,data:n,children:i=[]}=e,{class:r,staticClass:o,style:l,staticStyle:c,attrs:u={},...p}=n;return s("svg",{class:[r,o],style:[l,c],attrs:Object.assign({xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512.001 512.001"},u),...p},i.concat([s("path",{attrs:{d:"M284.286 256.002L506.143 34.144c7.811-7.811 7.811-20.475 0-28.285-7.811-7.81-20.475-7.811-28.285 0L256 227.717 34.143 5.859c-7.811-7.811-20.475-7.811-28.285 0-7.81 7.811-7.811 20.475 0 28.285l221.857 221.857L5.858 477.859c-7.811 7.811-7.811 20.475 0 28.285a19.938 19.938 0 0014.143 5.857 19.94 19.94 0 0014.143-5.857L256 284.287l221.857 221.857c3.905 3.905 9.024 5.857 14.143 5.857s10.237-1.952 14.143-5.857c7.811-7.811 7.811-20.475 0-28.285L284.286 256.002z"}})]))}}},bfc3:function(t,e,s){},e754:function(t,e,s){"use strict";var a=s("12cd"),n=s.n(a);n.a},f903:function(t,e,s){"use strict";var a=s("344f"),n=s.n(a);n.a}});
//# sourceMappingURL=app.a2b5efc9.js.map