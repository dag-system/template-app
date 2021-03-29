package com.$nom_application_en_minuscule.app;
import com.b8ne.RNPusherPushNotifications.NotificationsMessagingService;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactInstanceManager;
import android.content.Intent;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "Folomi";
  }

  protected void onStart() {
    super.onStart();

    ReactInstanceManager reactInstanceManager = getReactNativeHost().getReactInstanceManager();
    NotificationsMessagingService.read(reactInstanceManager, this);
  }

  @Override
  public void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    setIntent(intent);
    ReactInstanceManager reactInstanceManager = getReactNativeHost().getReactInstanceManager();
    NotificationsMessagingService.read(reactInstanceManager, this);
  }
}
