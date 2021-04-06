import haversine from 'haversine-distance';
import ApiUtils from '../ApiUtils';

export default class GpxService {
  calculDistanceFromStartChallenge(trace, position: any) {
    let startPoint = trace.positionsTrace[0];

    let distance = haversine(position, startPoint);

    return distance;
  }

  async isOnChallenge(trace, position: any) {
    let positions = trace.positionsTrace;


    this.getPointPassage(58)
      .then((responseJson) => {
        let resu = Object.values(responseJson);

        let checkPoints: any[] = [];
        checkPoints[0] = {
          latitude: positions[0].latitude,
          longitude: positions[0].longitude,
        };

        for(let i = 0; i < resu.length; i++)
        {
            checkPoints.push(resu[i]);
        }

        checkPoints.push({
            latitude: positions[positions.length - 1].latitude,
            longitude: positions[positions.length - 1].longitude,
          });
    
          if(this.isPointInChallenge(position, positions))
          {
            console.log("on challenge");
          }

      })
      .catch((e) => {});

    return false;
  }

  isFinishedChallenge(positions, segment)
  {

  }

  isPointInChallenge(position, segment :any[]) : boolean
  {
        for(let i = 0; i < segment.length; i++)
        {
            const dist = haversine(position, segment[i]);
            if(dist <= 30)
            {
                return true;
            }
        }
        return false;
  }

 isPointInArea(point: any, checkPoint: any, currentRadius: number) {
    let isPointInArea = false;

    const dist = haversine(point, checkPoint);

    if (dist < currentRadius) {
      isPointInArea = true;
      return true;
    }
    return isPointInArea;
  }

  async getPointPassage(idChallenge: number) {
    let formData = new FormData();
    formData.append('method', 'getPointPassage');
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('idChallenge', idChallenge.toString());

    return fetch(ApiUtils.getAPIUrl(), {
      method: 'POST',
      headers: {
        // Accept: 'application/json',
        // 'Content-Type': 'application/json',
      },
      body: formData,
    })
      .then(ApiUtils.checkStatus)
      .then((response) => {
        return response.json();
      });
  }
}
