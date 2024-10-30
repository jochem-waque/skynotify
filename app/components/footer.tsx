/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
export default function Footer({ absolute }: { absolute?: boolean }) {
  return (
    <footer
      className={`${absolute ? "absolute bottom-0" : ""} flex w-full justify-center`}
    >
      <p>&copy; {process.env.AUTHOR} 2024</p>
    </footer>
  )
}
