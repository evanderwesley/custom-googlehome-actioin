// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

let Config = {};

Config.devPortSmartHome = "8443";
Config.smartHomeProviderGoogleClientId = "ZxjqWpsYj3"; // client id that Google will use
Config.smartHomeProvideGoogleClientSecret = "hIMH3uWlMVrqa7FAbKLBoNUMCyLCtv"; // client secret that Google will use
Config.smartHomeProviderCloudEndpoint = "https://localhost:8443";

exports.devPortSmartHome = Config.devPortSmartHome;
exports.smartHomeProviderGoogleClientId = Config.smartHomeProviderGoogleClientId;
exports.smartHomeProvideGoogleClientSecret = Config.smartHomeProvideGoogleClientSecret;
exports.smartHomeProviderCloudEndpoint = Config.smartHomeProviderCloudEndpoint;

