import { renderAccountPage } from './account';
import { renderAuthGroupPage } from './auth-group';
import { renderBrandPage } from './brand';
import { renderCustomerPage } from './customer';
import { renderDecentralizationPage } from './decentralization';
import { renderEmployeePage } from './employee';
import { renderGuaranteePage } from './guarantee';
import { renderImportOrderPage } from './import-order';
import { renderImportProductPage } from './import-product';
import { renderOverviewPage } from './overview';
import { renderProductPage } from './product';
import { renderOrderPage } from './sell-order';
import { renderSupplierPage } from './supplier';
import { parseJwt, getLocalStorage, setLocalStorage } from '../utils/constains';
import { validation } from '../utils/validation';

let chart_1, chart_2;

function renderSidebar(permissionList) {
  const perList = [];
  permissionList.forEach((per) => {
    if (per['ten_chuc_nang'] === 'READ' && per['trang_thai_quyen_hang'] === true) {
      switch (per['ten_quyen_hang']) {
        case 'statistics':
          perList.push({
            label: 'Thống kê',
            slug: 'overview',
            icon: '<i class="fa-sharp fa-solid fa-chart-pie"></i>',
          });
          break;
        case 'decentralization':
          perList.push({
            label: 'Phân quyền',
            slug: 'decentralization',
            icon: '<i class="fa-solid fa-users-gear"></i>',
          });
          break;
        case 'brands':
          perList.push({
            label: 'Thương hiệu',
            slug: 'brand',
            icon: '<i class="fa-solid fa-list-ul"></i>',
          });
          break;
        case 'auth-groups':
          perList.push({
            label: 'Nhóm quyền',
            slug: 'auth-group',
            icon: '<i class="fa-solid fa-users"></i>',
          });
          break;
        case 'products':
          perList.push({
            label: 'Sản phẩm',
            slug: 'product',
            icon: '<i class="fa-solid fa-box-open"></i>',
          });
          break;
        case 'orders':
          perList.push({
            label: 'Đơn hàng',
            slug: 'sell-order',
            icon: '<i class="fa-solid fa-receipt"></i>',
          });
          break;
        case 'customers':
          perList.push({
            label: 'Khách hàng',
            slug: 'customer',
            icon: '<i class="fa-solid fa-user"></i>',
          });
          break;
        case 'employees':
          perList.push({
            label: 'Nhân viên',
            slug: 'employee',
            icon: '<i class="fa-solid fa-user-tie"></i>',
          });
          break;
        case 'accounts':
          perList.push({
            label: 'Tài khoản',
            slug: 'account',
            icon: '<i class="fa-regular fa-circle-user"></i>',
          });
          break;
        case 'guarantee':
          perList.push({
            label: 'Bảo hành',
            slug: 'guarantee',
            icon: '<i class="fa-solid fa-user-shield"></i>',
          });
          break;
        case 'suppliers':
          perList.push({
            label: 'Nhà cung cấp',
            slug: 'supplier',
            icon: '<i class="fa-solid fa-parachute-box"></i>',
          });
          break;
      }
    }
  });

  const importOrder = permissionList.findIndex(
    (per) =>
      per['ten_quyen_hang'] === 'import-orders' &&
      per['ten_chuc_nang'] === 'READ' &&
      per['trang_thai_quyen_hang'] === true
  );

  if (importOrder !== -1) {
    perList.push({
      label: 'Phiếu nhập',
      slug: 'import-order',
      icon: '<i class="fa-sharp fa-solid fa-receipt"></i>',
    });

    perList.push({
      label: 'Nhập hàng',
      slug: 'import-product',
      icon: '<i class="fa-solid fa-cart-arrow-down"></i>',
    });
  }

  const perHTML = perList
    .map(
      (per, idx) => `
        <div class="sidebar-item ${idx === 0 ? 'active' : ''}" data-value="${per.slug}">
          ${per.icon}
          <span>${per.label}</span>
        </div>
    `
    )
    .join('');

  $('.sidebar').html(perHTML);

  const url = new URL(window.location);

  if (!url.searchParams.get('content')) {
    const pageContent = $('.sidebar-item.active').attr('data-value');
    url.searchParams.set('content', pageContent);
    history.pushState({}, null, url);
  } else {
    $(`.sidebar-item[data-value=${url.searchParams.get('content')}]`).addClass('active');
  }

  $('.sidebar-item').click(async (e) => {
    let value;
    let target;
    const url = new URL(window.location);

    if (e.target.tagName === 'DIV') {
      target = e.target;
    } else {
      target = e.target.parentElement;
    }

    if (target.classList.contains('active')) return;

    $('.sidebar-item.active').removeClass('active');

    value = target.dataset.value;
    target.classList.add('active');

    url.searchParams.set('content', value);
    history.pushState({}, null, url);

    await handleSideBar(value);
  });
}

function initManager() {
  const accessToken = getLocalStorage('access_token');

  if (accessToken) {
    const token = parseJwt(accessToken);
    const now = parseInt(Date.now() / 1000);

    if (now > token.exp) {
      setLocalStorage('access_token', null);
      setLocalStorage('user', null);
      window.location.href = '/';
      return;
    }

    setLocalStorage('user', token.data);

    if (token.data.role['ma_nhom_quyen'] === 0) {
      window.location.href = '/';
      return;
    }

    renderSidebar(token.data.permission);

    return;
  }

  window.location.href = '/';
}

$('.overlay').click(() => {
  $('.admin-category').removeClass('active');
  $('.overlay').removeClass('active');

  $('.sidebar').css({
    transform: 'translateX(-100%)',
  });
});

$('.admin-category').click(() => {
  if ($('.admin-category').hasClass('active')) {
    $('.admin-category').removeClass('active');
    $('.overlay').removeClass('active');

    $('.sidebar').css({
      transform: 'translateX(-100%)',
    });
    return;
  }

  $('.admin-category').addClass('active');
  $('.overlay').addClass('active');

  $('.sidebar').css({
    transform: 'translateX(0)',
  });
});

async function initDashboard() {
  initManager();
  const url = new URL(window.location);
  let pageContent;

  if (!url.searchParams.has('content')) {
    url.searchParams.set('content', 'overview');
    history.pushState({}, null, url);

    if (!isAccess('statistics', 'READ')) {
      $('.admin-content').html(
        "<h1 class='text-center fw-bold fs-5'>Không được phép truy cập</h1>"
      );
      return;
    }

    const { chart1, chart2 } = await renderOverviewPage();

    chart_1 = chart1;
    chart_2 = chart2;
    $(".sidebar-item[data-value='overview']").addClass('active');
    return;
  }

  pageContent = url.searchParams.get('content');
  $('.sidebar-item.active').removeClass('active');
  $(`.sidebar-item[data-value=${pageContent}]`).addClass('active');

  await handleSideBar(pageContent);
}

function isAccess(perName, actionName) {
  const accessToken = getLocalStorage('access_token');

  const data = parseJwt(accessToken);

  if (parseInt(Date.now() / 1000) > data.exp) {
    setLocalStorage('user', null);
    setLocalStorage('access_token', null);
    window.location.href = '/';
    return false;
  }

  const { data: user } = data;

  try {
    chart_1?.destroy();
    chart_2?.destroy();
  } catch (error) {
    console.log(error.message);
  }

  if (!user) return false;

  const url = new URL(window.location);
  url.searchParams.delete('searching');
  url.searchParams.delete('sort-name');
  url.searchParams.delete('sort-action');
  url.searchParams.delete('from');
  url.searchParams.delete('to');
  history.pushState({}, '', url);

  const permissionList = user.permission;

  if (!permissionList || permissionList?.length <= 0) return false;

  const permission = permissionList.findIndex(
    (per) =>
      per['ten_quyen_hang'] === perName &&
      per['ten_chuc_nang'] === actionName &&
      per['trang_thai_quyen_hang'] === true
  );

  if (permission !== -1) {
    return true;
  }

  $('.admin-content').html("<h1 class='text-center fw-bold fs-5'>Không được phép truy cập</h1>");

  return false;
}

async function handleSideBar(value) {
  $('.admin-category').removeClass('active');
  $('.overlay').removeClass('active');

  $('.sidebar').css({
    transform: 'translateX(-100%)',
  });

  switch (value) {
    case 'overview':
      if (!isAccess('statistics', 'READ')) {
        break;
      }

      const { chart1, chart2 } = await renderOverviewPage();

      chart_1 = chart1;
      chart_2 = chart2;

      $('.admin-content').addClass('statistics');
      break;

    case 'brand':
      if (!isAccess('brands', 'READ')) {
        break;
      }

      renderBrandPage();
      $('.admin-content').removeClass('statistics');
      break;

    case 'sell-order':
      if (!isAccess('orders', 'READ')) {
        break;
      }

      renderOrderPage();
      $('.admin-content').removeClass('statistics');
      break;

    case 'import-order':
      if (!isAccess('import-orders', 'READ')) {
        break;
      }

      renderImportOrderPage();
      $('.admin-content').removeClass('statistics');
      break;

    case 'product':
      if (!isAccess('products', 'READ')) {
        break;
      }

      renderProductPage();
      $('.admin-content').removeClass('statistics');
      break;

    case 'customer':
      if (!isAccess('customers', 'READ')) {
        break;
      }

      renderCustomerPage();
      $('.admin-content').removeClass('statistics');
      break;

    case 'employee':
      if (!isAccess('employees', 'READ')) {
        break;
      }

      renderEmployeePage();
      $('.admin-content').removeClass('statistics');
      break;

    case 'auth-group':
      if (!isAccess('auth-groups', 'READ')) {
        break;
      }

      renderAuthGroupPage();
      $('.admin-content').removeClass('statistics');
      break;

    case 'decentralization':
      if (!isAccess('decentralization', 'READ')) {
        break;
      }

      renderDecentralizationPage();
      $('.admin-content').removeClass('statistics');
      break;
    case 'account':
      if (!isAccess('accounts', 'READ')) {
        break;
      }

      renderAccountPage();
      $('.admin-content').removeClass('statistics');
      break;

    case 'guarantee':
      if (!isAccess('guarantee', 'READ')) {
        break;
      }

      renderGuaranteePage();
      $('.admin-content').removeClass('statistics');
      break;

    case 'import-product':
      if (!isAccess('import-orders', 'READ')) {
        break;
      }

      renderImportProductPage();
      $('.admin-content').removeClass('statistics');
      break;

    case 'supplier':
      if (!isAccess('suppliers', 'READ')) {
        break;
      }

      renderSupplierPage();
      $('.admin-content').removeClass('statistics');
      break;
  }
}

initDashboard();

export function handleSearching(value, callback) {
  const url = new URL(window.location);
  const sortNameVal = url.searchParams.get('sort-name') ?? '';
  const sortActionVal = url.searchParams.get('sort-action') ?? '';

  if (!value) {
    url.searchParams.delete('searching');

    history.pushState({}, '', url);
    callback({
      sortName: sortNameVal,
      sortAction: sortActionVal,
    });
  } else {
    $('.header-input').val('');
    const url = new URL(window.location);
    url.searchParams.set('searching', value);
    history.pushState({}, '', url);
    callback({
      searching: value,
      sortName: sortNameVal,
      sortAction: sortActionVal,
    });
  }
}

export function handleSorting(e, callback) {
  const sort = e.target;

  const url = new URL(window.location);

  const sortVal = sort.dataset.sort;
  const name = sort.dataset.value;
  const searching = url.searchParams.has('searching') ? url.searchParams.get('searching') : '';

  sort.classList.remove('before');
  sort.classList.remove('after');

  if (sort.classList.contains('active')) {
    switch (sortVal) {
      case 'asc':
        sort.classList.add('before');
        sort.dataset.sort = 'desc';

        url.searchParams.set('sort-name', name);
        url.searchParams.set('sort-action', 'ASC');
        history.pushState({}, null, url);

        callback({
          sortAction: 'ASC',
          sortName: name,
          searching,
        });

        break;
      case 'desc':
        sort.classList.add('after');
        sort.dataset.sort = 'asc';

        url.searchParams.set('sort-name', name);
        url.searchParams.set('sort-action', 'DESC');
        history.pushState({}, null, url);

        callback({
          sortAction: 'DESC',
          sortName: name,
          searching,
        });
        break;
    }
    return;
  }

  $('.icon-sort.active').removeClass('before');
  $('.icon-sort.active').removeClass('after');
  $('.icon-sort.active').removeClass('active');

  sort.classList.add('active', 'before');

  url.searchParams.set('sort-name', name);
  url.searchParams.set('sort-action', 'ASC');
  history.pushState({}, null, url);

  callback({
    sortAction: 'ASC',
    sortName: name,
    searching,
  });
}

$('.modal-form input').keyup((e) => {
  let message = validation(e.target);
  if (message) {
    e.target.parentElement.classList.add('input-error');
  } else {
    e.target.parentElement.classList.remove('input-error');
  }
});

$('.modal-form input').blur((e) => {
  let message = validation(e.target);
  if (message) {
    e.target.parentElement.classList.add('input-error');
  } else {
    e.target.parentElement.classList.remove('input-error');
  }
});

$('.modal-form select').change((e) => {
  let message = validation(e.target);
  if (message) {
    e.target.parentElement.classList.add('select-error');
  } else {
    e.target.parentElement.classList.remove('select-error');
  }
});

$('.modal-form select').blur((e) => {
  let message = validation(e.target);
  if (message) {
    e.target.parentElement.classList.add('select-error');
  } else {
    e.target.parentElement.classList.remove('select-error');
  }
});
