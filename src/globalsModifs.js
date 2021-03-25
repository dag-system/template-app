export const TemplateDisplayName = 'Template Test';

export const TemplateAppName = removeAccents(
  TemplateDisplayName.trim().toLowerCase(),
);

export const TemplateOrganisation = 'TEMPLATETEST';

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

export const TemplateChallengeAutreName = 'Template Test Autre';

export const TemplateSportLive = [
  {idSport: 1, sportName: 'Course'},
  {idSport: 2, sportName: 'Marche'},
];

export const TemplateArrayImagesSponsorPath = [
  './src/assets/spons1.jpg',
  './src/assets/spons2.jpg',
];
export const TemplateArrayImagesPartenairesPath = [
  './src/assets/part1.jpg',
  './src/assets/part2.jpg',
];

function removeAccents(str) {
  const accents =
    "ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž' ";
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
