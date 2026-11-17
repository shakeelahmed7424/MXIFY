import { createElement, ReactElement, useState } from "react";
import { CustomTreeViewWidgetContainerProps } from "../typings/CustomTreeViewWidgetProps";
import { ObjectItem } from "mendix";
import "./ui/CustomTreeViewWidget.css";

interface TreeViewNode {
    id: string;
    displayName: string;
    hasChild: boolean;
    children: TreeViewNode[];
    source: ObjectItem;
}

function TreeNode({
    node,
    props
}: {
    node: TreeViewNode;
    props: Pick<CustomTreeViewWidgetContainerProps, "displayName" | "hasChild" | "children" | "parentIcon" | "childIcon" | "onClick">;
}): ReactElement {
    const [expanded, setExpanded] = useState(true);
    const toggle = () => setExpanded(e => !e);

    const handleClick = () => {
        const action = props.onClick?.get(node.source);
        if (action?.canExecute && node.source) {
            (action.execute as (obj: ObjectItem) => void)(node.source);
        }
    };

    return (
        <li>
            {node.hasChild ? (
                <span style={{ cursor: "pointer", fontWeight: 600 }} onClick={() => { toggle(); handleClick(); }}>
                    {props.parentIcon?.value?.uri ? (
                        <img src={props.parentIcon.value.uri} alt="folder" style={{ width: "1rem", marginRight: "0.5rem" }} />
                    ) : (
                        "📂"
                    )} {node.displayName}
                </span>
            ) : (
                <span onClick={handleClick} style={{ cursor: "pointer" }}>
                    {props.childIcon?.value?.uri ? (
                        <img src={props.childIcon.value.uri} alt="leaf" style={{ width: "1rem", marginRight: "0.5rem" }} />
                    ) : (
                        "🟢"
                    )} {node.displayName}
                </span>
            )}
            {expanded && node.children.length > 0 && (
                <ul>
                    {node.children.map(child => (
                        <TreeNode key={child.id} node={child} props={props} />
                    ))}
                </ul>
            )}
        </li>
    );
}

export function CustomTreeViewWidget({ items, displayName, hasChild, children, parentIcon, childIcon, onClick }: CustomTreeViewWidgetContainerProps): ReactElement {
    if (!items || items.status !== "available") {
        return <div>Loading...</div>;
    }

    const nodeMap = new Map<string, TreeViewNode>();
    const rootNodes: TreeViewNode[] = [];

    for (const item of items.items ?? []) {
        const id = item.id;
        const name = displayName.get(item).value ?? "Unnamed";
        const hasChilds = hasChild.get(item).value ?? false;
        nodeMap.set(id, { id, displayName: name, hasChild: hasChilds, children: [], source: item });
    }

    for (const item of items.items ?? []) {
        const parentIds = children.get(item).value;
        if (!parentIds || parentIds.length === 0) {
            rootNodes.push(nodeMap.get(item.id)!);
        } else {
            for (const parent of parentIds) {
                const parentNode = nodeMap.get(parent.id);
                if (parentNode) {
                    parentNode.children.push(nodeMap.get(item.id)!);
                }
            }
        }
    }

    return (
        <ul className="tree-view">
            {rootNodes.map(node => (
                <TreeNode
                    key={node.id}
                    node={node}
                    props={{ displayName, hasChild, children, parentIcon, childIcon, onClick }}
                />
            ))}
        </ul>
    );
}
