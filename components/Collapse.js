import useCollapse from 'react-collapsed';

export default function Collapse({ content, button }) {
  const { getCollapseProps, getToggleProps, isExpanded } = useCollapse();

  return (
    <div className="flex flex-col w-full">
      <button {...getToggleProps()}>{button}</button>
      <div className="collapse-content" {...getCollapseProps()}>
        {content}
      </div>
    </div>
  );
}
