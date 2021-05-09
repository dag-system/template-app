export default class Live {
  idLive!: number;
  statsLive: string |undefined;
  idSport!: number;
  libelleLive!: string;
  codeLive: string |undefined;
  coordinates? : any[];
  segmentEfforts? :any[];
  IsImportedFromGpx? : number;
  idActiviteStravaLive? : number;
  gpxLive? : string;
  dateCreationLive! : string;
  commentLive?: string;
}
