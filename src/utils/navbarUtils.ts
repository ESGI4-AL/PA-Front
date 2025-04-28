/**
 * Checks if a target element is a child of another element
 *
 * @param target The target element to check
 * @param elm The parent element to check against
 * @returns Boolean indicating if target is a child of elm
 */
export const checkParent = (target: EventTarget | null, elm: HTMLElement | null): boolean => {
  if (!target || !elm) return false;

  let currentTarget = target as HTMLElement;

  while (currentTarget.parentNode) {
    if (currentTarget === elm) {
      return true;
    }
    currentTarget = currentTarget.parentNode as HTMLElement;
  }

  return false;
};

/**
 * Handle clicks outside the navigation menu
 *
 * @param e The click event
 * @param navMenuDiv The navigation menu element
 * @param navMenu The navigation toggle button
 */
export const handleOutsideClick = (
  e: MouseEvent,
  navMenuDiv: HTMLElement | null,
  navMenu: HTMLElement | null
): void => {
  if (!navMenuDiv || !navMenu) return;

  const target = e.target;

  if (!checkParent(target, navMenuDiv)) {
    if (checkParent(target, navMenu)) {
      if (navMenuDiv.classList.contains('hidden')) {
        navMenuDiv.classList.remove('hidden');
      } else {
        navMenuDiv.classList.add('hidden');
      }
    } else {
      navMenuDiv.classList.add('hidden');
    }
  }
};

/**
 * Update the navbar style based on scroll position
 *
 * @param scrollPos Current scroll position
 * @param header Header element
 * @param navContent Navigation content element
 * @param navAction Navigation action button
 * @param toggleColours Elements with toggleColour class
 */
export const updateNavbarStyle = (
  scrollPos: number,
  header: HTMLElement | null,
  navContent: HTMLElement | null,
  navAction: HTMLElement | null,
  toggleColours: NodeListOf<Element>
): void => {
  if (!header || !navContent || !navAction) return;

  if (scrollPos > 10) {
    header.classList.add('bg-white');
    header.classList.add('shadow');

    navAction.classList.remove('bg-white');
    navAction.classList.add('gradient');
    navAction.classList.remove('text-gray-800');
    navAction.classList.add('text-white');

    // Update toggle colours
    for (let i = 0; i < toggleColours.length; i++) {
      toggleColours[i].classList.add('text-gray-800');
      toggleColours[i].classList.remove('text-white');
    }

    navContent.classList.remove('bg-gray-100');
    navContent.classList.add('bg-white');
  } else {
    header.classList.remove('bg-white');
    header.classList.remove('shadow');

    navAction.classList.remove('gradient');
    navAction.classList.add('bg-white');
    navAction.classList.remove('text-white');
    navAction.classList.add('text-gray-800');

    // Update toggle colours
    for (let i = 0; i < toggleColours.length; i++) {
      toggleColours[i].classList.add('text-white');
      toggleColours[i].classList.remove('text-gray-800');
    }

    navContent.classList.remove('bg-white');
    navContent.classList.add('bg-gray-100');
  }
};
