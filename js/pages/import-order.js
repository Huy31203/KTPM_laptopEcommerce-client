import moment from 'moment';
import { toast } from '../utils/toast';
import {
  convertCurrency,
  isAccessAction,
  renderLoadingManager,
  urlServer,
} from '../utils/constains';
import importOrderApi from '../api/importOrderApi';

function initImportOrder() {
  const now = new Date();
  const date = new Date();

  date.setMonth(date.getMonth() - 1);

  $('input[name="import-order-daterange"]').val(
    `${moment(date).format('L')} - ${moment(now).format('L')}`
  );

  const from = Math.floor(date.getTime() / 1000);
  const to = Math.floor(now.getTime() / 1000);

  const url = new URL(window.location);
  url.searchParams.set('from', from);
  url.searchParams.set('to', to);
  history.pushState({}, '', url);
}

export async function renderImportOrder(params) {
  try {
    const importOrderList = await importOrderApi.getAll(params);

    if (importOrderList.length <= 0) {
      $('.import-order-content').html(`
        <tr>
          <td colspan="6">
            <h1 class="text-center my-5 w-100">Không có phiếu nhập nào cả!!!</h1>  
          </td>
        </tr>
      `);
      return;
    }

    const importOrderHTML = importOrderList.map((order) => {
      return `
        <tr align="center">
          <td>
            ${order['ma_phieu_nhap']}
          </td>
          <td>
            ${order['ma_nhan_vien']}
          </td>
          <td>
            ${order['ma_nha_cung_cap']}
          </td>
          <td>
            ${order['ti_le_loi_nhuan']}
          </td>
          <td>
            ${moment(order['ngay_lap']).format('L')}
          </td>
          <td>
            <div class="d-flex justify-content-center align-items-center gap-2">
              <i class="fa-solid fa-circle-info text-primary admin-action view" data-id="${
                order['ma_phieu_nhap']
              }"></i>
              <i class="fa-solid fa-trash admin-action remove text-danger" data-id="${
                order['ma_phieu_nhap']
              }"></i>
            </div>
          </td>
        </tr>
      `;
    });

    $('.import-order-content').html(importOrderHTML);

    $('.import-order .admin-action.view').click(async (e) => {
      if (!isAccessAction('import-orders', 'READ')) return;
      $('#viewmoreImportOrderModal').modal('show');
      $('#viewmoreImportOrderModal').attr('data-id', e.target.dataset.id);
      await handleViewOrder(e.target.dataset.id);
    });

    $('.import-order .admin-action.remove').click(async (e) => {
      if (!isAccessAction('import-orders', 'DELETE')) return;
      $('#deleteImportOrderModal').modal('show');
      $('#deleteImportOrderModal').attr('data-id', e.target.dataset.id);
    });
  } catch (error) {
    console.log(error.message);
  }
}

async function handleViewOrder(id) {
  try {
    $('#viewmoreImportOrderModal').attr('data-id', id);
    $('#viewmoreImportOrderModal').modal('show');

    const importOrder = await importOrderApi.getById(id);

    $('#employee-import-order').val(importOrder['ma_nhan_vien']);
    $('#supplier-import-order').val(importOrder['ma_nha_cung_cap']);
    $('#percent-profit-import-order').val(importOrder['ti_le_loi_nhuan']);

    const productListHMTL = importOrder['danh_sach_san_pham_nhap_hang'].map((product) => {
      const price = convertCurrency(product['don_gia']);

      return `
          <div class="product-item">
            <div class="product-info">
              <div class="product-img">
                <img
                  src="${urlServer}/images/${product['hinh_anh']}"
                  alt="${product['ten_san_pham']}"
                />
              </div>
              <div class="product-content">
                <a href="./product-detail.html?id=${product['ma_san_pham']}" class="product-title">${product['ten_san_pham']}</a>
                <p class="product-new-price">${price} x ${product['so_luong_nhap_hang']}</p>
              </div>
            </div>
          </div>
        `;
    });

    $('#viewmoreImportOrderModal .product-list').html(productListHMTL);
    $('#viewmoreImportOrderModal .order-time span').html(
      moment(importOrder['ngay_lap'] * 1000).format('L')
    );

    let totalPay = convertCurrency(importOrder['tong_tien']);

    $('#viewmoreImportOrderModal .order-total-price span').html(totalPay);
  } catch (error) {
    console.log(error.message);
  }
}

$('#deleteImportOrderModal .btn-yes').click(async () => {
  if (!isAccessAction('import-orders', 'DELETE')) return;

  const id = $('#deleteImportOrderModal').attr('data-id');

  try {
    await importOrderApi.remove(id);
    toast({
      title: 'Xóa phiếu nhập thành công',
      type: 'success',
      duration: 3000,
    });

    const url = new URL(window.location);
    const searching = url.searchParams.get('searching') ?? '';
    const from = url.searchParams.get('from') ?? null;
    const to = url.searchParams.get('to') ?? null;
    const sortNameVal = url.searchParams.get('sort-name') ?? '';
    const sortActionVal = url.searchParams.get('sort-action') ?? '';
    renderImportOrder({
      searching,
      from,
      to,
      sortNameVal,
      sortActionVal,
    });
  } catch (error) {
    toast({
      title: 'Xóa phiếu nhập không thành công',
      type: 'success',
      duration: 3000,
    });
  } finally {
    $('#deleteImportOrderModal').modal('hide');
  }
});

export function renderImportOrderPage() {
  const loadingHTML = renderLoadingManager(18, 5);

  $('.admin-content').html(`
    <div class="import-order">
      <div class="import-order-header">
        <h1>Phiếu nhập</h1>
        <input type="text" name="import-order-daterange" value="" />
      </div>
      <div class="search-container">
        <div class="search-box">
          <input type="text" class="header-input" placeholder="Tìm kiếm theo mã phiếu nhập, mã nhân viên, mã nhà cung cấp" />
          <button type="button" class="btn primary btn-header">
            <i class="fa-solid fa-magnifying-glass"></i>
          </button>
        </div>
      </div>
      <div class="import-order-table-container">
        <table class="import-order-table">
          <thead>
            <tr align="center">
              <th>
                <div class="d-flex align-items-center justify-content-center gap-3 ">
                  Mã phiếu nhập
                  <div class="icon-sort active before" data-value="ma_phieu_nhap" data-sort="desc"></div>
                </div>
              </th>
              <th>
                <div class="d-flex align-items-center justify-content-center gap-3 ">
                  Mã nhân viên
                  <div class="icon-sort" data-value="ma_nhan_vien" data-sort="desc"></div>
                </div>
              </th>
              <th>
                <div class="d-flex align-items-center justify-content-center gap-3 ">
                  Mã nhà cung cấp
                  <div class="icon-sort" data-value="ma_nha_cung_cap" data-sort="desc"></div>
                </div>
              </th>
              <th>
                <div class="d-flex align-items-center justify-content-center gap-3 ">
                  Tỉ lệ lợi nhuận
                  <div class="icon-sort" data-value="ti_le_loi_nhuan" data-sort="desc"></div>
                </div>
              </th>
              <th>
                <div class="d-flex align-items-center justify-content-center gap-3 ">
                  Ngày lập
                  <div class="icon-sort" data-value="ngay_lap" data-sort="desc"></div>
                </div>
              </th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody class="import-order-content">
            ${loadingHTML}
          </tbody>
        </table>
      </div>
    </div>
  `);

  initImportOrder();

  const url = new URL(window.location);
  const from = url.searchParams.get('from') ?? null;
  const to = url.searchParams.get('to') ?? null;
  const searchingVal = url.searchParams.get('searching') ?? '';
  const sortNameVal = url.searchParams.get('sort-name') ?? '';
  const sortActionVal = url.searchParams.get('sort-action') ?? '';

  renderImportOrder({
    sortAction: sortActionVal,
    sortName: sortNameVal,
    searching: searchingVal,
    from,
    to,
  });

  $('.header-input').keypress(async (e) => {
    if (e.keyCode !== 13) return;

    const url = new URL(window.location);
    const value = e.target.value;
    const from = url.searchParams.get('from') ?? null;
    const to = url.searchParams.get('to') ?? null;
    const sortNameVal = url.searchParams.get('sort-name') ?? '';
    const sortActionVal = url.searchParams.get('sort-action') ?? '';

    if (!value) {
      url.searchParams.delete('searching');
      renderImportOrder({
        sortAction: sortActionVal,
        sortName: sortNameVal,
        from,
        to,
      });
    } else {
      $('.header-input').val('');
      url.searchParams.set('searching', value);

      renderImportOrder({
        sortAction: sortActionVal,
        sortName: sortNameVal,
        searching: value,
        from,
        to,
      });
    }
    history.pushState({}, '', url);
  });

  $('.btn-header').click(() => {
    const value = $('.header-input').val();
    const url = new URL(window.location);
    const from = url.searchParams.get('from') ?? null;
    const to = url.searchParams.get('to') ?? null;
    const sortNameVal = url.searchParams.get('sort-name') ?? '';
    const sortActionVal = url.searchParams.get('sort-action') ?? '';

    if (!value) {
      url.searchParams.delete('searching');
      renderImportOrder({
        sortAction: sortActionVal,
        sortName: sortNameVal,
        from,
        to,
      });
    } else {
      $('.header-input').val('');
      url.searchParams.set('searching', value);
      renderImportOrder({
        sortAction: sortActionVal,
        sortName: sortNameVal,
        searching: value,
        from,
        to,
      });
    }

    history.pushState({}, '', url);
  });

  $('input[name="import-order-daterange"]').daterangepicker(
    {
      opens: 'left',
    },
    async function (start, end, label) {
      let s = new Date(start.format());
      let e = new Date(end.format());

      s = s.getTime() / 1000;
      e = e.getTime() / 1000;

      const url = new URL(window.location);
      url.searchParams.set('from', s);
      url.searchParams.set('to', e);
      const searchingVal = url.searchParams.get('searching') ?? '';
      const sortNameVal = url.searchParams.get('sort-name') ?? '';
      const sortActionVal = url.searchParams.get('sort-action') ?? '';
      history.pushState({}, '', url);

      renderImportOrder({
        sortAction: sortActionVal,
        sortName: sortNameVal,
        searching: searchingVal,
        from: s,
        to: e,
      });
    }
  );

  $('.icon-sort').click((e) => {
    const sort = e.target;

    const url = new URL(window.location);

    const sortVal = sort.dataset.sort;
    const name = sort.dataset.value;
    const searching = url.searchParams.has('searching') ? url.searchParams.get('searching') : '';
    const from = url.searchParams.get('from') ?? null;
    const to = url.searchParams.get('to') ?? null;

    if (sort.classList.contains('active')) {
      sort.classList.remove('before');
      sort.classList.remove('after');

      switch (sortVal) {
        case 'asc':
          sort.classList.add('before');
          sort.dataset.sort = 'desc';

          url.searchParams.set('sort-name', name);
          url.searchParams.set('sort-action', 'ASC');
          history.pushState({}, null, url);

          renderImportOrder({
            sortAction: 'ASC',
            sortName: name,
            searching,
            from,
            to,
          });

          break;
        case 'desc':
          sort.classList.add('after');
          sort.dataset.sort = 'asc';

          url.searchParams.set('sort-name', name);
          url.searchParams.set('sort-action', 'DESC');
          history.pushState({}, null, url);

          renderImportOrder({
            sortAction: 'DESC',
            sortName: name,
            searching,
            from,
            to,
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

    renderImportOrder({
      sortAction: 'ASC',
      sortName: name,
      searching,
      from,
      to,
    });
  });
}
