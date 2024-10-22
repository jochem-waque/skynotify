/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import camelcaseKeys from "camelcase-keys"
import "server-only"
import { z } from "zod"

const Variables = z
  .object({ HOSTNAME: z.string() })
  .transform((arg) => camelcaseKeys(arg))
  .parse(process.env)

export default Variables
