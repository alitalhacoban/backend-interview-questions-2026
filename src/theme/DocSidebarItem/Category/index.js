import React from 'react';
import OriginalDocSidebarItemCategory from '@theme-original/DocSidebarItem/Category';

/**
 * Docusaurus expands an active category automatically. On a generated topic
 * overview that makes the first Learn screen feel open by default, so treat
 * only the category's own landing page as inactive. Child docs still expand
 * their parent category to keep the active page visible.
 */
export default function DocSidebarItemCategory(props) {
  const isCategoryLandingPage = props.item.href === props.activePath;
  return (
    <OriginalDocSidebarItemCategory
      {...props}
      activePath={isCategoryLandingPage ? '__collapsed_category__' : props.activePath}
    />
  );
}
