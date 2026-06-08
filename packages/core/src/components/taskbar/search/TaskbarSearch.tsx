import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import menuStyles from "../TaskbarMenus.module.css";
import searchStyles from "./TaskbarSearch.module.css";
import { useTaskbarContext } from "../taskbarSlots";
import { OutsideClickListener, useClassNames } from "../../../hooks";
import { TaskbarSearchMenu } from "./TaskbarSearchMenu";

export function TaskbarSearch() {
	const { toggleMenu } = useTaskbarContext();

	return <div className={searchStyles.SearchContainer}>
		<OutsideClickListener onOutsideClick={() => { toggleMenu("search", false); }}>
			<button
				className={useClassNames([menuStyles.MenuButton], "Taskbar", "SearchIcon")}
				title="Search"
				tabIndex={0}
				onClick={() => { toggleMenu("search"); }}
			>
				<FontAwesomeIcon icon={faSearch}/>
			</button>
			<TaskbarSearchMenu/>
		</OutsideClickListener>
	</div>;
}