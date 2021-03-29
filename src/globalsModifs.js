export const TemplateDisplayName = '$valueReplace';

export const TemplateAppName = purgeString(
  TemplateDisplayName.trim().toLowerCase(),
);

export const TemplateOrganisation = '$valueReplace';

export const TemplateBackgroundColor = '$valueReplace';

export const TemplateSiteLink = '$valueReplace';

export const TemplateNameAsk = $valueReplace;
export const TemplateFirstNameAsk = $valueReplace;
export const TemplateSexeAsk = $valueReplace;
export const TemplateDdnAsk = $valueReplace;
export const TemplateMailAsk = $valueReplace;
export const TemplateTelAsk = $valueReplace;
export const TemplateAdressAsk = $valueReplace;
export const TemplatePostalAsk = $valueReplace;
export const TemplateCityAsk = $valueReplace;
export const TemplateCountryAsk = $valueReplace;
export const TemplateTelVerifAsk = $valueReplace;
export const TemplateChallengeClub = $valueReplace;
export const TemplateChallengeFamille = $valueReplace;
export const TemplateChallengeAutre = $valueReplace;
export const TemplateChallengeEntreprise = $valueReplace;
export const TemplateHasAppDonation = false;

export const TemplateChallengeAutreName = '$valueReplace';

export const TemplateSportLive = [
  {idSport: 1, sportName: 'Course'},
  {idSport: 2, sportName: 'Marche'},
];

export const TemplateReplayTrace = [
  {label: 'Course Test', id: 58},
  {label: 'Course Test', id: 58},
];

export const TemplateArrayImagesSponsorPath = [];
export const TemplateArrayImagesPartenairesPath = ["./src/assets/part1.jpg","./src/assets/part2.jpg"];

function purgeString(str) {
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

