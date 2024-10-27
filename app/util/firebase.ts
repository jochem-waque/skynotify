/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { initializeApp } from "firebase/app"

const firebaseConfig = {
  apiKey: "AIzaSyAIdjBQRjp2IdFpEE72Mi54sqPJNwdrPI8",
  authDomain: "bluesky-post-notifications.firebaseapp.com",
  projectId: "bluesky-post-notifications",
  storageBucket: "bluesky-post-notifications.appspot.com",
  messagingSenderId: "392747462422",
  appId: "1:392747462422:web:5cd8afba9a75e483bb2a37",
}

const FirebaseApp = initializeApp(firebaseConfig)

export default FirebaseApp
