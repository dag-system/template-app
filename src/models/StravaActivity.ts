import StravaPolylineMap from './StravaPolylineMap';

export default interface StravaActivity {
  id: number;

  external_id: number;
  upload_id: number;
  name: string;
  athlete: any;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  elev_high: number;
  elev_low: number;
  type: any;
  start_date: Date;
  start_date_local: Date;
  timezone: string;
  start_latlng: any;
  end_latlng: any;
  achievement_count: number;
  kudos_count: number;
  athlete_count: number;
  photo_count: number;
  total_photo_count: number;
  map: StravaPolylineMap;
  trainer: boolean;
  commute: boolean;
  manual: boolean;
  private: boolean;
  flagged: boolean;
  workout_type: number;

  upload_id_str: string;
  average_speed: number;
  max_speed: number;
  has_kudoed: boolean;
  gear_id: string;
  kilojoules: number;

  average_watts: number;
  device_watts: number;
  max_watts: number;
  weighted_average_watts: number;
}
