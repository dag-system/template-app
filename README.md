#install 

fix image for xcode 14
npx react-native-fix-image


react-native run-ios --configuration Release --device "Your Device Name"


running on device: 
https://reactnative.dev/docs/running-on-device
https://bigbinary.com/blog/how-to-test-react-native-app-on-real-iphone


push notification 

curl -H "Content-Type: application/json" \
     -H "Authorization: Bearer 61740740A090C3029869440B30199CFE8BC15772D46C9A36C479C1CF216F41DF" \
     -X POST "https://653e46e5-9ff8-48ae-9591-feaa4054023e.pushnotifications.pusher.com/publish_api/v1/instances/653e46e5-9ff8-48ae-9591-feaa4054023e/publishes" \
     -d '{"interests":["debug-72950"],"fcm":{"notification":{"title":"Hello", "body":"Hello, world!", "data" : 
     
     
     
     }}}'

curl -H "Content-Type: application/json" \
     -H "Authorization: Bearer 61740740A090C3029869440B30199CFE8BC15772D46C9A36C479C1CF216F41DF" \
     -X POST "https://653e46e5-9ff8-48ae-9591-feaa4054023e.pushnotifications.pusher.com/publish_api/v1/instances/653e46e5-9ff8-48ae-9591-feaa4054023e/publishes" \
     -d '{"interests":["debug-72950"],"fcm":{
	"notification": {
		"title": "Hello",
		"body": "Hello, world!"
	},
	"data": {
		"notification": {
			"type": "effort",
			"idLive": 13,
			"nomActivite": "Activité de l’ après midi",
			"nomSegment": "cross insa",
			"distanceSegment": 1.2,
			"tempsSegmentString": "00:11:01",
			"vitesseMoyenneSegment": "11:01"
		}
	}
}
     
     }'
