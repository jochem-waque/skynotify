/**
 * Copyright (C) 2024-2025  Jochem Waqué
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
export type NotificationPayload = {
  title: string
  body?: string
  icon?: string
  image?: string
  tag?: string
  timestamp?: string
  url?: string
}
