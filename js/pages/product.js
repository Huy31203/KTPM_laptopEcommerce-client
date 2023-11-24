import brandApi from '../api/brandApi';
import productApi from '../api/productApi';
import uploadApi from '../api/uploadApi';
import { handleSearching, handleSorting } from './manager';
import { isAccessAction, renderLoadingManager, urlServer } from '../utils/constains';
import { toast } from '../utils/toast';
import { validation } from '../utils/validation';

async function renderProduct(params = '') {
  try {
    const { data } = await productApi.getAll(params);

    if (data.length <= 0) {
      $('.product .product-content').html(`
        <tr>
          <td colspan="6">
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
            <td>${product['ten_san_pham']}</td>
            <td>
              <div class="product-img">
                <img src="${urlServer}/images/${product['hinh_anh'][0]}" alt="${
          product['hinh_anh'][0]
        }" />
              </div>
            </td>
            <td>
              <div class="toggle">
                <input
                  type="checkbox"
                  id="toggle-${product['ma_san_pham']}"
                  name="outstanding-product"
                  hidden
                  ${product['noi_bat'] ? 'checked' : ''}
                  data-id="${product['ma_san_pham']}"
                />
                <label for="toggle-${product['ma_san_pham']}">
                  <div class="toggle"></div>
                </label>
              </div>
            </td>
            <td>
              <div class="${product['so_luong'] <= 0 ? 'outStock' : 'inStock'}">
                ${product['so_luong'] <= 0 ? 'hết hàng' : 'còn hàng'}
              </div>
            </td>
            <td>
              <div class="d-flex justify-content-center align-items-center gap-2">
                <i class="fa-solid fa-pen-to-square admin-action edit text-secondary" data-id="${
                  product['ma_san_pham']
                }"></i>
                <i class="fa-solid fa-trash admin-action remove text-danger" data-id="${
                  product['ma_san_pham']
                }"></i>
              </div>
            </td>
          </tr>
        `;
      })
      .join('');

    $('.product .product-content').html(dataHTML);

    $('.product .toggle input').change(async (e) => {
      if (!isAccessAction('products', 'UPDATE')) {
        e.target.checked = !e.target.checked;
        return;
      }

      try {
        const id = e.target.dataset.id;

        const data = {
          ma_san_pham: id,
          noi_bat: e.target.checked,
        };

        await productApi.update(data);
      } catch (error) {
        console.log(error.message);
      }
    });

    $('.product .admin-action.edit').click(async (e) => {
      if (!isAccessAction('products', 'UPDATE')) return;

      const id = e.target.dataset.id;
      fileUpdateList = [];

      const product = data.find((p) => p['ma_san_pham'] === Number(id));

      $('#viewAndUpdateProductModal').attr('data-id', id);

      $('#viewAndUpdateProductModal').modal('show');

      $('#viewAndUpdateProductModal #product-name-update').val(product['ten_san_pham']);
      $('#viewAndUpdateProductModal #product-guarantee-update').val(product['bao_hanh']);
      $('#viewAndUpdateProductModal #product-port-update').val(product['so_cong_luu_tru_toi_da']);
      $('#viewAndUpdateProductModal #product-price-update').val(product['gia_goc']);
      $('#viewAndUpdateProductModal #product-sale-update').val(product['giam_gia']);
      $('#viewAndUpdateProductModal #product-cpu-gen-update').val(product['the_he_cpu']);
      $('#viewAndUpdateProductModal #product-cpu-update').val(product['cpu']);
      $('#viewAndUpdateProductModal #product-cpu-series-update').val(product['series_cpu']);
      $('#viewAndUpdateProductModal #product-chip-update').val(product['chip_do_hoa_roi']);
      $('#viewAndUpdateProductModal #product-save-update').val(product['luu_tru']);
      $('#viewAndUpdateProductModal #product-screen-update').val(product['man_hinh']);
      $('#viewAndUpdateProductModal #product-ram-name-update').val(product['ten_ram']);
      $('#viewAndUpdateProductModal #product-ram-size-update').val(product['dung_luong_ram']);
      $('#viewAndUpdateProductModal #product-slot-update').val(product['kieu_khe_m2_ho_tro']);
      $('#viewAndUpdateProductModal #product-screen-port-update').val(product['cong_xuat_hinh']);
      $('#viewAndUpdateProductModal #product-connect-port-update').val(product['cong_ket_noi']);
      $('#viewAndUpdateProductModal #product-wireless-update').val(product['ket_noi_khong_day']);
      $('#viewAndUpdateProductModal #product-keyboard-update').val(product['ban_phim']);
      $('#viewAndUpdateProductModal #product-os-update').val(product['he_dieu_hanh']);
      $('#viewAndUpdateProductModal #product-size-update').val(product['kich_thuoc']);
      $('#viewAndUpdateProductModal #product-pin-update').val(product['pin']);
      $('#viewAndUpdateProductModal #product-weight-update').val(product['khoi_luong']);
      $('#viewAndUpdateProductModal #product-series-laptop-update').val(product['series_laptop']);
      $('#viewAndUpdateProductModal #product-part-num-update').val(product['part_number']);
      $('#viewAndUpdateProductModal #product-color-update').val(product['mau_sac']);
      $('#viewAndUpdateProductModal #product-led-update').attr('checked', product['den_led']);
      $('#viewAndUpdateProductModal #product-touch-screen-update').attr(
        'checked',
        product['man_hinh_cam_ung']
      );
      $('#viewAndUpdateProductModal #product-gear-update').val(product['phu_kien_di_kem']);
      $('#viewAndUpdateProductModal #product-amount-update').val(product['so_luong']);
      $('#viewAndUpdateProductModal #product-brand-update').val(product['thuong_hieu']);
      $('#viewAndUpdateProductModal #product-desc-update').val(product['mo_ta_san_pham']);

      const dataHTML = product['hinh_anh'].map((image) => {
        return `
          <div class="col-12 col-sm-6 product-preview-image_item mb-3">
            <img
              src="${urlServer}/images/${image}"
              alt=""
            />
            <i class="fa-solid fa-trash product-preview-image_icon" data-name='${image}'></i>
          </div>
        `;
      });

      $('#viewAndUpdateProductModal .product-preview-image').html(dataHTML);

      fileUpdateList.push(...product['hinh_anh']);

      $('#viewAndUpdateProductModal .product-preview-image_icon').click((e) => {
        const name = e.target.dataset.name;

        const isHas = fileUpdateList.findIndex((item) => item.name === name);

        fileUpdateList.splice(isHas, 1);

        if (fileUpdateList.length <= 0) {
          $('#viewAndUpdateProductModal #product-image-update')[0] = null;
          $('#viewAndUpdateProductModal #product-image-update').val('');
        }

        previewProductImage(fileUpdateList, '#viewAndUpdateProductModal');
      });
    });

    $('.product .admin-action.remove').click((e) => {
      if (!isAccessAction('products', 'DELETE')) return;

      const id = e.target.dataset.id;

      $('#deleteProductModal').modal('show');
      $('#deleteProductModal').attr('data-id', id);
    });
  } catch (error) {
    console.log('object');
  }
}

async function renderBrandSelect() {
  try {
    const { data } = await brandApi.getAll();

    data.push({
      ten_thuong_hieu: 'chọn thương hiệu',
    });

    const dataHTML = data
      .map((brand) => {
        if (brand['ten_thuong_hieu'] === 'chọn thương hiệu') {
          return `
              <option value="" hidden selected>${brand['ten_thuong_hieu']}</option>
            `;
        }

        return `
          <option value="${brand['ten_thuong_hieu']}">${brand['ten_thuong_hieu']}</option>
        `;
      })
      .join('');

    $('#createProductModal #product-brand-create').html(dataHTML);
    $('#viewAndUpdateProductModal #product-brand-update').html(dataHTML);
  } catch (error) {
    console.log(error.message);
  }
}

$('#createProductModal .btn-create').click(async () => {
  const input = Array.from($('#createProductModal input'));
  const select = Array.from($('#createProductModal select'));
  const textarea = Array.from($('#createProductModal textarea'));

  const validateList = [...input, ...select, ...textarea];
  let isValid = true;

  validateList.forEach((item) => {
    if (validation(item)) {
      isValid = false;
    }
  });

  if (!isValid) return;

  const ten_san_pham = $('#createProductModal #product-name-create').val();
  const bao_hanh = $('#createProductModal #product-guarantee-create').val();
  const so_cong_luu_tru_toi_da = $('#createProductModal #product-port-create').val();
  const gia_goc = $('#createProductModal #product-price-create').val();
  const giam_gia = $('#createProductModal #product-sale-create').val() ?? 0;
  const the_he_cpu = $('#createProductModal #product-cpu-gen-create').val();
  const cpu = $('#createProductModal #product-cpu-create').val();
  const series_cpu = $('#createProductModal #product-cpu-series-create').val();
  const chip_do_hoa_roi = $('#createProductModal #product-chip-create').val();
  const luu_tru = $('#createProductModal #product-save-create').val();
  const man_hinh = $('#createProductModal #product-screen-create').val();
  const ten_ram = $('#createProductModal #product-ram-name-create').val();
  const dung_luong_ram = $('#createProductModal #product-ram-size-create').val();
  const kieu_khe_m2_ho_tro = $('#createProductModal #product-slot-create').val();
  const cong_xuat_hinh = $('#createProductModal #product-screen-port-create').val();
  const cong_ket_noi = $('#createProductModal #product-connect-port-create').val();
  const ket_noi_khong_day = $('#createProductModal #product-wireless-create').val();
  const ban_phim = $('#createProductModal #product-keyboard-create').val();
  const he_dieu_hanh = $('#createProductModal #product-os-create').val();
  const kich_thuoc = $('#createProductModal #product-size-create').val();
  const pin = $('#createProductModal #product-pin-create').val();
  const khoi_luong = $('#createProductModal #product-weight-create').val();
  const series_laptop = $('#createProductModal #product-series-laptop-create').val();
  const part_number = $('#createProductModal #product-part-num-create').val();
  const mau_sac = $('#createProductModal #product-color-create').val();
  const den_led = $('#createProductModal #product-led-create').is(':checked') ? true : false;
  const man_hinh_cam_ung = $('#createProductModal #product-touch-screen-create').is(':checked')
    ? true
    : false;
  const phu_kien_di_kem = $('#createProductModal #product-gear-create').val();
  const thuong_hieu = $('#createProductModal #product-brand-create').val();
  const mo_ta_san_pham = $('#createProductModal #product-desc-create').val() ?? 'Đang cập nhật...';
  const hinh_anh = fileAddList;

  const hinh_anh_name = hinh_anh.map((file) => file.name);

  const data = {
    ten_san_pham,
    bao_hanh,
    so_cong_luu_tru_toi_da,
    gia_goc,
    giam_gia,
    the_he_cpu,
    cpu,
    series_cpu,
    chip_do_hoa_roi,
    luu_tru,
    man_hinh,
    ten_ram,
    dung_luong_ram,
    kieu_khe_m2_ho_tro,
    cong_xuat_hinh,
    cong_ket_noi,
    ket_noi_khong_day,
    ban_phim,
    he_dieu_hanh,
    kich_thuoc,
    pin,
    khoi_luong,
    series_laptop,
    part_number,
    mau_sac,
    den_led,
    man_hinh_cam_ung,
    phu_kien_di_kem,
    thuong_hieu,
    mo_ta_san_pham,
    hinh_anh: hinh_anh_name,
    created_at: Math.floor(Date.now() / 1000),
  };

  try {
    hinh_anh.forEach(async (file) => {
      const formData = new FormData();
      formData.append('uploadfile', file);
      await uploadApi.add(formData);
    });

    await productApi.add(data);

    $('#createProductModal').modal('hide');

    toast({
      title: 'Thêm sản phẩm thành công',
      type: 'success',
      duration: 2000,
    });

    renderProduct();
  } catch (error) {
    toast({
      title: 'Thêm sản phẩm không thành công',
      type: 'error',
      message: error.message,
      duration: 2000,
    });
  }
});

$('#viewAndUpdateProductModal .btn-update').click(async () => {
  const input = Array.from($('#viewAndUpdateProductModal input:not(#product-image)'));
  const select = Array.from($('#viewAndUpdateProductModal select'));
  const textarea = Array.from($('#viewAndUpdateProductModal textarea'));

  const validateList = [...input, ...select, ...textarea];
  let isValid = true;

  validateList.forEach((item) => {
    if (validation(item)) {
      isValid = false;
    }
  });

  if (fileUpdateList.length <= 0) {
    isValid = false;
  }

  if (!isValid) return;

  const ten_san_pham = $('#viewAndUpdateProductModal #product-name-update').val();
  const bao_hanh = $('#viewAndUpdateProductModal #product-guarantee-update').val();
  const so_cong_luu_tru_toi_da = $('#viewAndUpdateProductModal #product-port-update').val();
  const gia_goc = $('#viewAndUpdateProductModal #product-price-update').val();
  const giam_gia = $('#viewAndUpdateProductModal #product-sale-update').val();
  const the_he_cpu = $('#viewAndUpdateProductModal #product-cpu-gen-update').val();
  const cpu = $('#viewAndUpdateProductModal #product-cpu-update').val();
  const series_cpu = $('#viewAndUpdateProductModal #product-cpu-series-update').val();
  const chip_do_hoa_roi = $('#viewAndUpdateProductModal #product-chip-update').val();
  const luu_tru = $('#viewAndUpdateProductModal #product-save-update').val();
  const man_hinh = $('#viewAndUpdateProductModal #product-screen-update').val();
  const ten_ram = $('#viewAndUpdateProductModal #product-ram-name-update').val();
  const dung_luong_ram = $('#viewAndUpdateProductModal #product-ram-size-update').val();
  const kieu_khe_m2_ho_tro = $('#viewAndUpdateProductModal #product-slot-update').val();
  const cong_xuat_hinh = $('#viewAndUpdateProductModal #product-screen-port-update').val();
  const cong_ket_noi = $('#viewAndUpdateProductModal #product-connect-port-update').val();
  const ket_noi_khong_day = $('#viewAndUpdateProductModal #product-wireless-update').val();
  const ban_phim = $('#viewAndUpdateProductModal #product-keyboard-update').val();
  const he_dieu_hanh = $('#viewAndUpdateProductModal #product-os-update').val();
  const kich_thuoc = $('#viewAndUpdateProductModal #product-size-update').val();
  const pin = $('#viewAndUpdateProductModal #product-pin-update').val();
  const khoi_luong = $('#viewAndUpdateProductModal #product-weight-update').val();
  const series_laptop = $('#viewAndUpdateProductModal #product-series-laptop-update').val();
  const part_number = $('#viewAndUpdateProductModal #product-part-num-update').val();
  const mau_sac = $('#viewAndUpdateProductModal #product-color-update').val();
  const den_led = $('#viewAndUpdateProductModal #product-led-update').is(':checked') ? true : false;
  const man_hinh_cam_ung = $('#viewAndUpdateProductModal #product-touch-screen-update').is(
    ':checked'
  )
    ? true
    : false;
  const phu_kien_di_kem = $('#viewAndUpdateProductModal #product-gear-update').val();
  const thuong_hieu = $('#viewAndUpdateProductModal #product-brand-update').val();
  const mo_ta_san_pham = $('#viewAndUpdateProductModal #product-desc-update').val();
  const hinh_anh = fileUpdateList;

  const hinh_anh_name = hinh_anh.map((file) => (!file.name ? file : file.name));

  const data = {
    ma_san_pham: $('#viewAndUpdateProductModal').attr('data-id'),
    ten_san_pham,
    bao_hanh,
    so_cong_luu_tru_toi_da,
    gia_goc,
    giam_gia,
    the_he_cpu,
    cpu,
    series_cpu,
    chip_do_hoa_roi,
    luu_tru,
    man_hinh,
    ten_ram,
    dung_luong_ram,
    kieu_khe_m2_ho_tro,
    cong_xuat_hinh,
    cong_ket_noi,
    ket_noi_khong_day,
    ban_phim,
    he_dieu_hanh,
    kich_thuoc,
    pin,
    khoi_luong,
    series_laptop,
    part_number,
    mau_sac,
    den_led,
    man_hinh_cam_ung,
    phu_kien_di_kem,
    thuong_hieu,
    mo_ta_san_pham,
    hinh_anh: hinh_anh_name,
    updated_at: Math.floor(Date.now() / 1000),
  };

  try {
    hinh_anh.forEach(async (file) => {
      if (!file.name) return;

      const formData = new FormData();
      formData.append('uploadfile', file);
      await uploadApi.add(formData);
    });

    await productApi.update(data);

    $('#viewAndUpdateProductModal').modal('hide');

    toast({
      title: 'Chỉnh sửa sản phẩm thành công',
      type: 'success',
      duration: 2000,
    });

    renderProduct();
  } catch (error) {
    toast({
      title: 'Chỉnh sửa sản phẩm không thành công',
      type: 'error',
      message: error.message,
      duration: 2000,
    });
  }
});

let fileAddList = [];
let fileUpdateList = [];

$('#createProductModal #product-image-create').change((e) => {
  const fileList = [...e.target.files];

  fileList.forEach((file) => {
    const isHas = fileAddList.findIndex((item) => item.name === file.name);
    if (isHas === -1) {
      fileAddList.push(...e.target.files);
    }
  });

  previewProductImage(fileAddList, '#createProductModal');
});

$('#viewAndUpdateProductModal #product-image-update').change((e) => {
  const fileList = [...e.target.files];

  fileList.forEach((file) => {
    const isHas = fileUpdateList.findIndex((item) => item.name === file.name);
    if (isHas === -1) {
      fileUpdateList.push(...e.target.files);
    }
  });

  previewProductImage(fileUpdateList, '#viewAndUpdateProductModal');
});

function previewProductImage(data, id) {
  const dataHTML = data.map((file) => {
    if (!file.name)
      return `
      <div class="col-12 col-sm-6 product-preview-image_item mb-3">
        <img
          src="${urlServer}/image/${file}"
          alt=""
        />
        <i class="fa-solid fa-trash product-preview-image_icon" data-name='${file}'></i>
      </div>
    `;

    return `
      <div class="col-12 col-sm-6 product-preview-image_item mb-3">
        <img
          src="${URL.createObjectURL(file)}"
          alt=""
        />
        <i class="fa-solid fa-trash product-preview-image_icon" data-name='${file.name}'></i>
      </div>
    `;
  });

  $(`${id} .product-preview-image`).html(dataHTML);

  $(`${id} .product-preview-image_icon`).click((e) => {
    const name = e.target.dataset.name;

    const isHas = data.findIndex((item) => item.name === name);

    data.splice(isHas, 1);

    if (data.length <= 0) {
      $(`${id} #product-image`)[0] = null;
      $(`${id} #product-image`).val('');
    }

    previewProductImage(data, id);
  });
}

$('#deleteProductModal .btn-yes').click(async () => {
  const id = $('#deleteProductModal').attr('data-id');

  try {
    await productApi.remove(id);

    renderProduct();

    toast({
      title: 'Xóa thành công',
      type: 'success',
      duration: 2000,
    });
  } catch (error) {
    toast({
      title: 'Xóa không thành công',
      message: error.message,
      type: 'error',
      duration: 2000,
    });
  } finally {
    $('#deleteProductModal').modal('hidden');
  }
});

export function renderProductPage() {
  const loadingHTML = renderLoadingManager(18, 6);

  $('.admin-content').html(`
    <div class="product">
      <div class="product-header">
        <h1>Sản phẩm</h1>
        <div>
          <i class="fa-solid fa-circle-plus"></i> thêm sản phẩm
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
      <div class="product-table-container">
        <table class="product-table">
          <thead>
            <tr align="center">
              <th>
                <div class="d-flex align-items-center justify-content-center gap-3 ">
                  Mã sản phẩm
                  <div class="icon-sort active before" data-value="ma_san_pham" data-sort="desc"></div>
                </div>
              </th>
              <th>
                <div class="d-flex align-items-center justify-content-center gap-3 ">
                  Tên sản phẩm
                  <div class="icon-sort before" data-value="ten_san_pham" data-sort="desc"></div>
                </div>
              </th>
              <th>
                Hình ảnh
              </th>
              <th>Nổi bật</th>
              <th>Hàng trong kho</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody class="product-content">
            ${loadingHTML}
          </tbody>
        </table>
      </div>
    </div>
  `);

  renderBrandSelect();

  const url = new URL(window.location);
  const searchingVal = url.searchParams.get('searching') ?? '';
  const sortNameVal = url.searchParams.get('sort-name') ?? '';
  const sortActionVal = url.searchParams.get('sort-action') ?? '';

  renderProduct({
    sortAction: sortActionVal,
    sortName: sortNameVal,
    searching: searchingVal,
  });

  $('.product-header div').click(() => {
    if (!isAccessAction('products', 'CREATE')) return;

    $('#createProductModal').modal('show');
  });

  $('.header-input').keypress(async (e) => {
    if (e.keyCode !== 13) return;

    handleSearching(e.target.value, renderProduct);
  });

  $('.btn-header').click(() => {
    handleSearching($('.header-input').val(), renderProduct);
  });

  $('.icon-sort').click((e) => {
    handleSorting(e, renderProduct);
  });
}
