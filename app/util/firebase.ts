/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { Config } from "@/firebase"
import { initializeApp } from "firebase/app"

const FirebaseApp = initializeApp(Config)

export default FirebaseApp
