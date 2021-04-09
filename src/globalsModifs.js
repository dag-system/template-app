export const TemplateDisplayName = "Template Test";

export const IsDemo = true;

export const TemplateExpirationDate = new Date();

export const TemplateAppName = purgeString(
  TemplateDisplayName.trim().toLowerCase(),
);

export const TemplateOrganisation = '32THDEMOAPP';

export const TemplateIdOrganisation = '9';

export const TemplateBackgroundColor = '#FFFFFF';

export const TemplateSiteLink = 'www.dag-system.com';

export const TemplateNameAsk = true;
export const TemplateFirstNameAsk = true;
export const TemplateSexeAsk = true;
export const TemplateDdnAsk = true;
export const TemplateMailAsk = true;
export const TemplateTelAsk = true;
export const TemplateAdressAsk = true;
export const TemplatePostalAsk = true;
export const TemplateCityAsk = true;
export const TemplateCountryAsk = true;
export const TemplateTelVerifAsk = true;
export const TemplateChallengeClub = true;
export const TemplateChallengeFamille = true;
export const TemplateChallengeAutre = true;
export const TemplateChallengeEntreprise = true;
export const TemplateHasAppDonation = false;
export const TemplateIsPaying = false;

export const TemplateChallengeAutreName = 'Template Test Autre';

export const TemplateSportLive = [];
export const TemplateTrace = [];

export const TemplateArrayImagesSponsorPath = [ require('./assets/logo.png'),require('./assets/logo.png')];
// export const image = require('./assets/logo.png');
export const TemplateArrayImagesPartenairesPath = [ require('./assets/logo.png'),require('./assets/logo.png')];

function purgeString(str) {
  const accents =
    'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž\' ,*-_#|/="~';
  const accentsOut =
    'AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZz';
  str = str.split('');
  const strLen = str.length;
  let i, x;
  for (i = 0; i < strLen; i++) {
    if ((x = accents.indexOf(str[i])) != -1) {
      str[i] = accentsOut[x];
    }
  }
  return str.join('');
}
