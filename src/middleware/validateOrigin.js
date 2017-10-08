const url = require('url');
const serverconf = require("../config/serverconfig")

//Checks if the Origin comes from our Ember Applikation
module.exports = function(req, res, next) {

  const dickbutt =  
  "                                    Youshalln                                         "+"\n"+
  "                                otenterthisDomain                                    "+ "\n"+
  "                            filtyPeasantYoushallnote                                  "+"\n"+
  "                    nterthisDomainf           iltyPeas                                "+"\n"+
  "                 antYoushallno                  tentert                               "+"\n"+
  "               hisDomainfiltyP                   easant                               "+"\n"+
  "               Youshallnotenter                   thisD                               "+"\n"+
  "               omainfiltyP easant    Youshallnot  enter                               "+"\n"+
  "               thisDomainfiltyPeas antYoushallnote nter                               "+"\n"+
  "               thisDomainfiltyPe  asantYoushallnotenter                               "+"\n"+
  "              thisD  omainfiltyP  easantYoushallnotente                               "+"\n"+
  "             rthisDomainfiltyPeas antYoushall notentert                               "+"\n"+
  "            hisDomainfiltyPeasa   ntYoushallnotenterthi                               "+"\n"+
  "           sDomainfiltyPeasantYoushallnotentert  hisDo                                "+"\n"+
  "          mainf          iltyPeasantYoushal     lnoten                                "+"\n"+
  "         terth                      isDomai     nfilty                                "+"\n"+
  "        Peasan                                 tYoush                                 "+"\n"+
  "       allnot                                 entert                                  "+"\n"+
  "      hisDom                                  ainfil                                  "+"\n"+
  "      tyPea                      sant        Yousha                                   "+"\n"+
  "      llno                      tente rth   isDoma                                    "+"\n"+
  "      infi                      ltyPeasant  Yoush                         allnotent   "+"\n"+
  "    erthi                      sDomainfi  ltyPe                        asantYoushal  "+"\n"+
  "   lnote                     nterthisDo mainf                       iltyPe    asan  "+"\n"+
  "    tYous                     hallnoten  terth                     isDomai    nfilt  "+"\n"+
  "     yPeas                    antYousha  llnote                   nterthi     sDoma   "+"\n"+
  "     infil                    tyPeasan   tYoushallnotenterthi   sDomain     filty     "+"\n"+
  "      Peas                   antYoush    allnotenterthisDomainfiltyPe      asant      "+"\n"+
  "      Yous                   hallnot     enter   thisD   omainfilty      Peasan       "+"\n"+
  "      tYou                  shallnot      ent   erthisDomainfilty      Peasan         "+"\n"+
  "     tYous               halln otent         erthisDomainfiltyP     easantY          "+"\n"+
  "      oush             allno  tentert         hisDomainfiltyPeasa   ntYousha         "+"\n"+
  "       llnot            enterthisDomai                     nfiltyPe    asantYous      "+"\n"+
  "        halln            otenterthisD              omai       nfilty  Peas antYo      "+"\n"+
  "        ushall              note                   nter        thisDo  mainfilt       "+"\n"+
  "         yPeasa                                ntY              ousha    llno         "+"\n"+
  "          tenterth                            isDo              mainf     ilty        "+"\n"+
  "             Peasant                          Yous              hallnotenterth        "+"\n"+
  "   isD        omainfilty                       Peas           antYoushallnote         "+"\n"+
  "  nterthi    sDomainfiltyPeasa                  ntY         oushall    n              "+"\n"+
  "  otenterthisDom ainfiltyPeasantYousha           llno    tentert                      "+"\n"+
  "  hisD omainfiltyPeas    antYoushallnote nterthisDomainfiltyPe                        "+"\n"+
  "   asan  tYoushalln         otenterthis DomainfiltyPeasantY                           "+"\n"+
  "    oush   allnot         enterthisDom ainfi ltyPeasantY                              "+"\n"+
  "     oushallnot           enterthisDo  main                                           "+"\n"+
  "      filtyPe              asantYou   shal                                            "+"\n"+
  "        lno                tenter    this                                             "+"\n"+
  "                            Domain  filt                                              "+"\n"+
  "                             yPeasantYo                                               "+"\n"+
  "                               ushalln                                                "+"\n"+
  "                                 ote                                                   "

  const ref = req.headers.referer;
  if (ref) {
    const urlParse = url.parse(ref);
    if(urlParse && urlParse.host === serverconf.address + ':4200') return next();
    else res.send(403, dickbutt);
  } else {
    res.send(403, dickbutt);
  }
}