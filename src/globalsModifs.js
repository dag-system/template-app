export const TemplateDisplayName = 'Jeux du Val-de-Marne';

export const IsDemo = false;

export const TemplateExpirationDate = new Date('2021-05-06T22:00:00.000Z');

export const TemplateAppName = purgeString(
  romanizeString(TemplateDisplayName.toLowerCase()),
);

export const TemplateOrganisation = purgeString(
  romanizeString(TemplateDisplayName.toUpperCase()),
);

export const TemplateIdOrganisation = '362';

export const TemplateBackgroundColor = '#009DE0';
export const TemplateSecondColor = '#FFFFFF';

export const textAutoBackgroundColor = autoColor(TemplateBackgroundColor);
export const textAutoSecondColor = autoColor(TemplateSecondColor);

export const TemplateSiteLink = 'www.dag-system.com';

export const TemplateNameAsk = true;
export const TemplateFirstNameAsk = true;
export const TemplateSexeAsk = true;
export const TemplateDdnAsk = false;
export const TemplateMailAsk = true;
export const TemplateTelAsk = false;
export const TemplateAdressAsk = true;
export const TemplatePostalAsk = true;
export const TemplateCityAsk = true;
export const TemplateCountryAsk = false;
export const TemplateTelVerifAsk = true;
export const TemplateChallengeClub = false;
export const TemplateChallengeFamille = false;
export const TemplateChallengeAutre = false;
export const TemplateChallengeEntreprise = false;
export const TemplateHasAppDonation = false;
export const TemplateIsPaying = false;

export const TemplateChallengeAutreName = 'Template Test Autre';

export const TemplateSportLive = [
  {idSport: 13, sportName: 'MARCHE'},
  {idSport: 24, sportName: 'Course à pied'},
  {idSport: 27, sportName: 'Course à pied'},
];
export const TemplateTrace = [{label: 'Ne pas afficher ', id: '616'}];

export const TemplateArrayImagesSponsorPath = [
  require('./assets/sponsor_logo1.png'),
  require('./assets/sponsor_logo2.png'),
  require('./assets/sponsor_logo3.png'),
];
export const TemplateArrayImagesPartenairesPath = [];

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

function autoColor(color) {
  max = hexToRgb(color).r + hexToRgb(color).g + hexToRgb(color).b;
  if (max > (3 * 256) / 2) {
    return '#000000';
  } else {
    return '#FFFFFF';
  }
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function romanizeString(str) {
  let res = str.match(/\d+/g);
  if (res != null) {
    for (let number of res) {
      str = str.replace(number, romanize(number));
    }
  }
  return str;
}

function romanize(num) {
  var lookup = {
      M: 1000,
      CM: 900,
      D: 500,
      CD: 400,
      C: 100,
      XC: 90,
      L: 50,
      XL: 40,
      X: 10,
      IX: 9,
      V: 5,
      IV: 4,
      I: 1,
    },
    roman = '',
    i;
  for (i in lookup) {
    while (num >= lookup[i]) {
      roman += i;
      num -= lookup[i];
    }
  }
  return roman;
}
