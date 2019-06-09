// Modules and Components here
import { NgModule } from '@angular/core';
import { BrowserModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicGestureConfig } from 'src/directives/long-press';
import { ImageViewerComponent } from './component/image-viewer/image-viewer.component';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader} from '@ngx-translate/core';
import { IonicStorageModule } from '@ionic/storage';
import { TranslateHttpLoader} from '@ngx-translate/http-loader';
import { GifComponent } from './component/gif/gif.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LocationComponent } from './component/location/location.component';
import { LanguageComponent } from './component/language/language.component';
// Plugins
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { SpinnerDialog } from '@ionic-native/spinner-dialog/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { File } from '@ionic-native/file/ngx';
import { FCM } from '@ionic-native/fcm/ngx';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { Facebook } from '@ionic-native/facebook/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { AppRate } from '@ionic-native/app-rate/ngx';
import { Network } from '@ionic-native/network/ngx';
import { MediaCapture } from '@ionic-native/media-capture/ngx';
import { StreamingMedia, StreamingVideoOptions } from '@ionic-native/streaming-media/ngx';
import { VideoEditor, CreateThumbnailOptions } from '@ionic-native/video-editor/ngx';
// Firebase
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { firebaseConfig } from 'src/environments/firebase.config';
import { AngularFireModule } from '@angular/fire';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { AngularFireAuthModule } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
// Providers, Services and Directives
import { UsersProvider } from './provider/users';
import { RequestProvider } from './provider/request';
import { NotificationsProvider } from './provider/notifications';
import { FriendsProvider } from './provider/friends';
import { BlockProvider } from './provider/block';
import { ChatProvider } from './provider/chat';
import { EmojiPickerComponent } from './component/emoji-picker/emoji-picker.component';
import { NgxMaskIonicModule } from 'ngx-mask-ionic';
import { DocumentService } from './provider/document.service';


export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

// initialize firebase
firebase.initializeApp(firebaseConfig);

@NgModule({
  declarations: [
    AppComponent,
    ImageViewerComponent,
    GifComponent,
    LocationComponent,
    EmojiPickerComponent,
    LanguageComponent
  ],
  entryComponents: [
    ImageViewerComponent,
    GifComponent,
    LocationComponent,
    EmojiPickerComponent,
    LanguageComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireStorageModule,
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    IonicStorageModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    NgxMaskIonicModule.forRoot()
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Camera,
    StreamingMedia,
    Geolocation,
    File,
    NativeAudio,
    SocialSharing,
    InAppBrowser,
    FCM,
    MediaCapture,
    VideoEditor,
    AppRate,
    Facebook,
    FileChooser,
    Network,
    FilePath,
    SpinnerDialog,
    UsersProvider,
    RequestProvider,
    NotificationsProvider,
    FriendsProvider,
    BlockProvider,
    ChatProvider,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HAMMER_GESTURE_CONFIG, useClass: IonicGestureConfig },
    DocumentService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}


