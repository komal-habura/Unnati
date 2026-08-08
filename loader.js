function renderSharedMarkup(targetId, html) {
  const target = document.getElementById(targetId);
  if (target) {
    target.innerHTML = html;
  } else {
    document.body.insertAdjacentHTML('afterbegin', `<div id="${targetId}"></div>`);
    document.getElementById(targetId).innerHTML = html;
  }
}

function getActiveClass(pageName, targetName) {
  return pageName === targetName ? 'active' : '';
}

function buildHeaderMarkup(pageName) {
  const headerTemplate = window.UNNATI_HEADER_TEMPLATE || '';
  return headerTemplate
    .replace('__HOME__', getActiveClass(pageName, 'index'))
    .replace('__ABOUT__', getActiveClass(pageName, 'about'))
    .replace('__PILLARS__', '')
    .replace('__MEMBERSHIP__', '')
    .replace('__NEWSLETTERS__', getActiveClass(pageName, 'newsletters'))
    .replace('__CONTACT__', getActiveClass(pageName, 'contact'));
}

function loadSharedMarkup() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  const pageName = page.replace('.html', '');

  const headerHtml = buildHeaderMarkup(pageName);
  const footerHtml = window.UNNATI_FOOTER_TEMPLATE || '';

  renderSharedMarkup('site-header', headerHtml);
  renderSharedMarkup('site-footer', footerHtml);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadSharedMarkup);
} else {
  loadSharedMarkup();
}
