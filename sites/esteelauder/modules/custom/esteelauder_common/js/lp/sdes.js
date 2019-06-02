
if (window.location == window.parent.location) {
  lpTag.sdes = lpTag.sdes || [];
  lpTag.sdes.push({ "type": "ctmrinfo", "info": {"cstatus": Drupal.settings.lp.cstatus} });
}
