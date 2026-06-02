import { isObject, ReactElementLike } from "../../../src/features";

const REACT_ELEMENT = Symbol.for("react.element");
const REACT_FRAGMENT = Symbol.for("react.fragment");

export type ReactElementMock = ReactElementLike & { children?: ReactElementLike | ReactElementLike[] };
export type ComponentMock = Omit<ReactElementMock, "type"> & { name: string };

export function mockComponent({ name, ...element }: ComponentMock) {
	return mockElement({
		type: { name },
		...element,
	});
}

export function mockFragment(element?: Omit<ReactElementMock, "type">) {
	return mockElement({ type: REACT_FRAGMENT, ...element });
}

export function mockElement(element: ReactElementMock): ReactElementLike {
	if (isObject(element.props) && "children" in element.props) {
		element.props.children = mockChild(element.props.children);
	}

	return Object.assign(element, { $$typeof: REACT_ELEMENT });
}

function mockChild(child: unknown): unknown {
	if (Array.isArray(child))
		return child.map(mockChild);

	return isObject(child) && child.type ? mockFragment(child) : child;
}