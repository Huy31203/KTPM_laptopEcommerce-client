import detailProductApi from '../api/detailProductApi';
import importOrderApi from '../api/importOrderApi';
import productApi from '../api/productApi';
import supplierApi from '../api/supplierApi';
import { handleSearching, handleSorting } from './manager';
import {
  convertCurrency,
  getLocalStorage,
  isAccessAction,
  renderLoadingManager,
  urlServer,
} from '../utils/constains';
import { toast } from '../utils/toast';
import { validation } from '../utils/validation';

async function renderImportProduct(params = '') {
  try {
    const { data } = await productApi.getAll(params);

    if (data.length <= 0) {
      $('.import-product-content').html(`
        <tr>
          <td colspan="4">
            <h1 class="text-center my-5 w-100">Không có sản phẩm nào cả!!!</h1>  
          </td>
        </tr>
      `);
      return;
    }

    const dataHTML = data
      .map((product) => {
        return `
          <tr align="center">
            <td>${product['ma_san_pham']}</td>
            <td>
              <div class="import-product-img">
                <img src="${urlServer}/images/${product['hinh_anh'][0]}" alt="${product['ten_san_pham']}" />
              </div>
            </td>
            <td>
              ${product['ten_san_pham']}
            </td>
            <td>
              <input type="checkbox" name="import-product" value="${product['ma_san_pham']}"/>
            </td>
          </tr>
        `;
      })
      .join('');

    $('.import-product .import-product-content').html(dataHTML);
  } catch (error) {
    console.log('object');
  }
}

let productList = [];

function handleValidate(e) {
  let message = validation(e.target);
  if (message) {
    e.target.parentElement.classList.add('input-error');
  } else {
    e.target.parentElement.classList.remove('input-error');
  }
}

function handleAmountProduct() {
  const inputList = Array.from($('.product-list input#price-import-product'));

  let totalPay = inputList.reduce((p, c) => {
    const amount = $(`.import-product_amount[data-id='${c.dataset.id}'] input`).val();
    return p + Number(c.value) * amount;
  }, 0);

  totalPay = convertCurrency(totalPay);

  $('.order-total-price span').html(totalPay);
}

async function renderImportProductModalContent(ckbList) {
  const { userId } = getLocalStorage('user');
  $('#employee-import-product').val(userId);

  const { data } = await productApi.getAll();

  const dataFilter = data.filter((product) => {
    const isHas = ckbList.findIndex((item) => item.value == product['ma_san_pham']);

    if (isHas !== -1) return product;
  });

  productList = dataFilter;

  let totalPrice = convertCurrency(0);

  const dataHTML = dataFilter.map(
    (product) => `
    <div class="product-item">
      <div class="product-img">
        <img
          src="${urlServer}/images/${product['hinh_anh'][0]}"
          alt="${product['ten_san_pham']}"
        />
      </div>
      <div class="product-content">
        <a href="./product-detail.html?id=${product['ma_san_pham']}" class="product-title">${product['ten_san_pham']}</a>
        <div class="import-product_amount" data-id="${product['ma_san_pham']}">
          <i class="fa-solid fa-minus disabled"></i>
          <input type="number" min="1" value="1" data-amount="1" rules="required|positive"/>
          <i class="fa-solid fa-plus"></i>
        </div>
        <div class="input_container mb-1">
          <div class="input">
            <input
              id="price-import-product"
              type="number"
              placeholder="Giá..."
              rules="required|positive"
              data-id="${product['ma_san_pham']}"
              value="${product['gia_goc']}"
            />
            VNĐ
          </div>
          <span class="text-danger mb-1 error"></span>
        </div>
      </div>
    </div>
  `
  );

  $('#createImportProductModal .product-list').html(dataHTML);
  $('#createImportProductModal .order-total-price span').html(totalPrice);

  $('.product-list input#price-import-product').blur((e) => {
    handleValidate(e);
    if (!e.target.value || Number(e.target.value) <= 0) return;

    const inputList = Array.from($('.product-list input#price-import-product'));

    let totalPay = inputList.reduce((p, c) => {
      const amount = $(`.import-product_amount[data-id="${c.dataset.id}"] input`).val();

      return p + Number(c.value) * amount;
    }, 0);

    totalPay = convertCurrency(totalPay);

    $('.order-total-price span').html(totalPay);
  });

  $('.import-product_amount input').change((e) => {
    if (!e.target.value) {
      e.target.value = e.target.dataset.amount;
      return;
    }

    const value = Number(e.target.value);

    if (value <= 0) {
      e.target.value = e.target.dataset.amount;
      return;
    }

    if (value === 1) {
      e.target.classList.add('disabled');
      $('.import-product_amount .fa-minus').addClass('disabled');
      const productIdx = productList.findIndex(
        (product) => product['ma_san_pham'] === Number(e.target.parentElement.dataset.id)
      );

      productList[productIdx]['so_luong'] = value;

      handleAmountProduct();
      return;
    }

    $('.import-product_amount .fa-minus').removeClass('disabled');

    const productIdx = productList.findIndex(
      (product) => product['ma_san_pham'] === Number(e.target.parentElement.dataset.id)
    );

    productList[productIdx]['so_luong'] = value;

    handleAmountProduct();

    e.target.dataset.amount = value;
  });

  $('.import-product_amount .fa-minus').click((e) => {
    const id = e.target.parentElement.dataset.id;
    const input = $(`.import-product_amount[data-id="${id}"] input`);

    if (Number(input.val()) === 1) {
      e.target.classList.add('disabled');
      return;
    }

    input.val(Number(input.val()) - 1);
    input[0].dataset.amount = Number(input.val()) - 1;

    e.target.classList.remove('disabled');

    if (Number(input.val()) === 1) {
      e.target.classList.add('disabled');
      const productIdx = productList.findIndex(
        (product) => product['ma_san_pham'] === Number(e.target.parentElement.dataset.id)
      );

      productList[productIdx]['so_luong'] = Number(input.val());

      handleAmountProduct();
      return;
    }

    e.target.classList.remove('disabled');

    const productIdx = productList.findIndex(
      (product) => product['ma_san_pham'] === Number(e.target.parentElement.dataset.id)
    );

    productList[productIdx]['so_luong'] = Number(input.val());

    handleAmountProduct();
  });

  $('.import-product_amount .fa-plus').click((e) => {
    const id = e.target.parentElement.dataset.id;
    const input = $(`.import-product_amount[data-id="${id}"] input`);

    $(`.import-product_amount[data-id="${id}"] .fa-minus`).removeClass('disabled');

    input.val(Number(input.val()) + 1);
    input[0].dataset.amount = Number(input.val()) + 1;

    const productIdx = productList.findIndex(
      (product) => product['ma_san_pham'] === Number(e.target.parentElement.dataset.id)
    );

    productList[productIdx]['so_luong'] = Number(input.val());

    handleAmountProduct();
  });
}

async function renderSupplierSelect() {
  try {
    const data = await supplierApi.getAll();

    const dataSelect = [
      {
        ma_nha_cung_cap: '',
        ten_nha_cung_cap: 'Chọn nhà cung cấp',
      },
      ...data,
    ];

    const dataHTML = dataSelect.map((supp) => {
      if (!supp['ma_nha_cung_cap']) {
        return `
          <option value="${supp['ma_nha_cung_cap']}" hidden selected>${supp['ten_nha_cung_cap']}</option>
        `;
      }
      return `
        <option value="${supp['ma_nha_cung_cap']}">${supp['ten_nha_cung_cap']}</option>
      `;
    });

    $('#supplier-import-product').html(dataHTML);
  } catch (error) {
    console.log(error.message);
  }
}

export function renderImportProductPage() {
  const loadingHTML = renderLoadingManager(18, 4);

  $('.admin-content').html(`
    <div class="import-product">
      <div class="import-product-header">
        <h1>Nhập hàng</h1>
        <div>
          <i class="fa-solid fa-circle-plus"></i> nhập hàng
        </div>
      </div>
      <div class="search-container">
        <div class="search-box">
          <input type="text" class="header-input" placeholder="Tìm kiếm theo mã, tên, thương hiệu sản phẩm" />
          <button type="button" class="btn primary btn-header">
            <i class="fa-solid fa-magnifying-glass"></i>
          </button>
        </div>
      </div>
      <div class="import-product-table-container">
        <table class="import-product-table">
          <thead>
            <tr align="center">
              <th>
                <div class="d-flex align-items-center justify-content-center gap-3 ">
                  Mã sản phẩm
                  <div class="icon-sort active before" data-value="ma_san_pham" data-sort="desc"></div>
                </div>
              </th>
              <th>Hình ảnh</th>
              <th>
                <div class="d-flex align-items-center justify-content-center gap-3 ">
                  Tên sản phẩm
                  <div class="icon-sort" data-value="ten_san_pham" data-sort="desc"></div>
                </div>
              </th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody class="import-product-content">
            ${loadingHTML}
          </tbody>
        </table>
      </div>
    </div>
  `);

  const url = new URL(window.location);
  const searchingVal = url.searchParams.get('searching') ?? '';
  const sortNameVal = url.searchParams.get('sort-name') ?? '';
  const sortActionVal = url.searchParams.get('sort-action') ?? '';

  renderImportProduct({
    sortAction: sortActionVal,
    sortName: sortNameVal,
    searching: searchingVal,
  });

  $('.header-input').keypress(async (e) => {
    if (e.keyCode !== 13) return;

    handleSearching(e.target.value, renderImportProduct);
  });

  $('.btn-header').click(() => {
    handleSearching($('.header-input').val(), renderImportProduct);
  });

  $('.import-product-header div').click(async () => {
    if (!isAccessAction('import-orders', 'CREATE')) return;

    const ckbList = Array.from($('.import-product-content input[type="checkbox"]:checked'));

    if (ckbList.length <= 0) {
      toast({
        title: 'Bạn chưa chọn sản phẩm để nhập hàng',
        type: 'warning',
        duration: 3000,
      });
      return;
    }

    await renderImportProductModalContent(ckbList);
    await renderSupplierSelect();

    $('#createImportProductModal').modal('show');

    const inputList = Array.from($('.product-list input#price-import-product'));

    let totalPay = inputList.reduce((p, c) => p + Number(c.value), 0);

    totalPay = convertCurrency(totalPay);

    $('.order-total-price span').html(totalPay);

    $('#createImportProductModal input').blur((e) => {
      handleValidate(e);
    });

    $('#createImportProductModal input').keyup((e) => {
      handleValidate(e);
    });

    $('#createImportProductModal select').blur((e) => {
      let message = validation(e.target);
      if (message) {
        e.target.parentElement.classList.add('select-error');
      } else {
        e.target.parentElement.classList.remove('select-error');
      }
    });

    $('#createImportProductModal select').change((e) => {
      let message = validation(e.target);
      if (message) {
        e.target.parentElement.classList.add('select-error');
      } else {
        e.target.parentElement.classList.remove('select-error');
      }
    });
  });

  $('.icon-sort').click((e) => {
    handleSorting(e, renderImportProduct);
  });
}

$('#createImportProductModal .btn-add').click(async () => {
  if (!isAccessAction('import-orders', 'CREATE')) return;

  const input = Array.from($('#createImportProductModal input'));
  const select = Array.from($('#createImportProductModal select'));

  const validList = [...input, ...select];

  let isValid = true;

  validList.forEach((item) => {
    if (validation(item)) {
      if (item.tagName === 'SELECT') {
        item.parentElement.classList.add('select-error');
      } else {
        item.parentElement.classList.add('input-error');
      }
      isValid = false;
    }
  });

  if (!isValid) return;

  const profitPercent = Number($('#createImportProductModal #profit-import-product').val());
  const supplier = $('#createImportProductModal #supplier-import-product').val();
  const { userId } = getLocalStorage('user');
  const created_at = Date.now();

  const importProductList = productList.map((product) => {
    const gia_goc = Number(
      $(`#createImportProductModal input[data-id="${product['ma_san_pham']}"]`).val()
    );

    const so_luong = Number(
      $(
        `#createImportProductModal .import-product_amount[data-id="${product['ma_san_pham']}"] input`
      ).val()
    );

    let gia_goc_moi = gia_goc + (gia_goc * profitPercent) / 100;

    if (product['gia_goc'] <= gia_goc_moi) {
      return {
        ma_san_pham: product['ma_san_pham'],
        gia_goc: gia_goc_moi,
        gia_nhap: gia_goc,
        so_luong: so_luong,
      };
    }

    return {
      ma_san_pham: product['ma_san_pham'],
      gia_goc: product['gia_goc'],
      gia_nhap: gia_goc,
      so_luong: so_luong,
    };
  });

  try {
    await importOrderApi.add({
      ma_nha_cung_cap: supplier,
      ti_le_loi_nhuan: profitPercent,
      ma_nhan_vien: userId,
      ngay_lap: created_at,
      danh_sach_san_pham_nhap_hang: importProductList,
    });

    importProductList.forEach(async (product) => {
      await productApi.update({
        ma_san_pham: product['ma_san_pham'],
        gia_goc: product['gia_goc'],
      });

      await detailProductApi.add({
        ma_san_pham: product['ma_san_pham'],
        so_luong_da_mua: product['so_luong'],
      });
    });

    toast({
      title: 'Tạo phiếu nhập thành công',
      type: 'success',
      duration: 3000,
    });
  } catch (error) {
    toast({
      title: 'Tạo phiếu nhập không thành công',
      type: 'error',
      duration: 3000,
    });
  } finally {
    $('#createImportProductModal').modal('hide');
  }
});
