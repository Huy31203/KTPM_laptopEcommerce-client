import supplierApi from '../api/supplierApi';
import { handleSearching, handleSorting } from './manager';
import { isAccessAction, renderLoadingManager } from '../utils/constains';
import { toast } from '../utils/toast';
import { validation } from '../utils/validation';

async function renderSupplier(params = '') {
  try {
    const supplierList = await supplierApi.getAll(params);

    if (supplierList.length <= 0) {
      $('.supplier-content').html(`
        <tr>
          <td colspan="3">
            <h1 class="text-center my-5 w-100">Không có nhà cung cấp nào cả!!!</h1>  
          </td>
        </tr>
      `);
      return;
    }

    const supplierHTML = supplierList.map(
      (supplier) => `
        <tr align="center">
          <td>
            ${supplier['ma_nha_cung_cap']}
          </td>
          <td>
            ${supplier['ten_nha_cung_cap']}
          </td>
          <td>
            ${supplier['so_dien_thoai']}
          </td>
          <td>
            ${supplier['dia_chi']}
          </td>
          <td>
            <div class="d-flex align-items-center justify-content-center gap-2">
              <i class="fa-solid fa-pen-to-square admin-action edit" data-id="${supplier['ma_nha_cung_cap']}"></i>
              <i class="fa-solid fa-trash admin-action remove text-danger" data-id="${supplier['ma_nha_cung_cap']}"></i>
            </div>
          </td>
        </tr>
      `
    );

    $('.supplier-content').html(supplierHTML);

    $('.supplier .admin-action.remove').click((e) => {
      if (!isAccessAction('suppliers', 'DELETE')) return;

      $('#deleteSupplierModal').modal('show');
      $('#deleteSupplierModal').attr('data-id', e.target.dataset.id);
    });

    $('.supplier .admin-action.edit').click(async (e) => {
      if (!isAccessAction('suppliers', 'UPDATE')) return;

      try {
        const id = e.target.dataset.id;
        const data = await supplierApi.getById(id);

        $('#name-supplier-update').val(data['ten_nha_cung_cap']);
        $('#phone-supplier-update').val(data['so_dien_thoai']);
        $('#address-supplier-update').val(data['dia_chi']);

        $('#updateSupplierModal').modal('show');
        $('#updateSupplierModal').attr('data-id', id);
      } catch (error) {
        console.log(error.message);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
}

$('#updateSupplierModal .btn-save').click(async () => {
  if (!isAccessAction('suppliers', 'UPDATE')) return;

  try {
    const input = Array.from($('#updateSupplierModal input'));
    let isValid = true;

    input.forEach((item) => {
      if (validation(item)) {
        isValid = false;
      }
    });

    if (!isValid) {
      return;
    }

    const id = $('#updateSupplierModal').attr('data-id');

    const name = $('#name-supplier-update').val();
    const phone = $('#phone-supplier-update').val();
    const address = $('#address-supplier-update').val();

    const data = {
      ma_nha_cung_cap: id,
      ten_nha_cung_cap: name,
      so_dien_thoai: phone,
      dia_chi: address,
    };

    await supplierApi.update(data);

    toast({
      title: 'Thay đổi nhà cung cấp thành công',
      type: 'success',
      duration: 2000,
    });

    renderSupplier();
  } catch (error) {
    toast({
      title: 'Thay đổi nhà cung cấp không thành công',
      message: error.message,
      type: 'error',
      duration: 2000,
    });
  } finally {
    $('#updateSupplierModal').modal('hide');
  }
});

$('#createSupplierModal .btn-add').click(async () => {
  if (!isAccessAction('suppliers', 'CREATE')) return;

  const input = Array.from($('#createSupplierModal input'));
  let isValid = true;

  input.forEach((item) => {
    if (validation(item)) {
      isValid = false;
    }
  });

  if (!isValid) {
    return;
  }

  const name = $('#name-supplier-create').val();
  const phone = $('#phone-supplier-create').val();
  const address = $('#address-supplier-create').val();

  try {
    await supplierApi.add({
      ten_nha_cung_cap: name,
      so_dien_thoai: phone,
      dia_chi: address,
    });

    toast({
      title: 'Thêm nhà cung cấp thành công',
      type: 'success',
      duration: 2000,
    });

    renderSupplier();

    $('#name-supplier-create').val('');
    $('#phone-supplier-create').val('');
    $('#address-supplier-create').val('');
  } catch (error) {
    toast({
      title: 'Thêm nhà cung cấp không thành công',
      message: error.message,
      type: 'error',
      duration: 2000,
    });
  } finally {
    $('#createSupplierModal').modal('hide');
  }
});

function handleValidate(e) {
  let message = validation(e.target);
  if (message) {
    e.target.parentElement.classList.add('input-error');
  } else {
    e.target.parentElement.classList.remove('input-error');
  }
}

$('#createSupplierModal input').keyup(handleValidate);
$('#createSupplierModal input').blur(handleValidate);

$('#updateSupplierModal input').keyup(handleValidate);
$('#updateSupplierModal input').blur(handleValidate);

$('#deleteSupplierModal .btn-yes').click(async () => {
  if (!isAccessAction('suppliers', 'DELETE')) return;

  try {
    const id = $('#deleteSupplierModal').attr('data-id');

    await supplierApi.remove(id);

    toast({
      title: 'Xóa nhà cung cấp không thành công',
      type: 'success',
      duration: 2000,
    });

    renderSupplier();
  } catch (error) {
    toast({
      title: 'Xóa nhà cung cấp không thành công',
      message: error.message,
      type: 'error',
      duration: 2000,
    });
  } finally {
    $('#deleteSupplierModal').modal('hide');
  }
});

export function renderSupplierPage() {
  const loadingHTML = renderLoadingManager(18, 5);

  $('.admin-content').html(`
    <div class="supplier">
      <div class="supplier-header">
        <h1>Nhà cung cấp</h1>
        <div>
          <i class="fa-solid fa-circle-plus"></i> thêm nhà cung cấp
        </div>
      </div>
      <div class="search-container">
        <div class="search-box">
          <input type="text" class="header-input" placeholder="Tìm kiếm theo mã, tên, số điện thoại, địa chỉ nhà cung cấp" />
          <button type="button" class="btn primary btn-header">
            <i class="fa-solid fa-magnifying-glass"></i>
          </button>
        </div>
      </div>
      <div class="supplier-table-container">
        <table class="supplier-table">
          <thead>
            <tr align="center">
              <th>
                <div class="d-flex align-items-center justify-content-center gap-3 ">
                  Mã nhà cung cấp
                  <div class="icon-sort active before" data-value="ma_nha_cung_cap" data-sort="desc"></div>
                </div>
              </th>
              <th>
                <div class="d-flex align-items-center justify-content-center gap-3 ">
                  Tên nhà cung cấp
                  <div class="icon-sort" data-value="ten_nha_cung_cap" data-sort="desc"></div>
                </div>
              </th>
              <th>
                <div class="d-flex align-items-center justify-content-center gap-3 ">
                  Số điện thoại
                  <div class="icon-sort" data-value="so_dien_thoai" data-sort="desc"></div>
                </div>
              </th>
              <th>
                <div class="d-flex align-items-center justify-content-center gap-3 ">
                  Địa chỉ
                  <div class="icon-sort" data-value="dia_chi" data-sort="desc"></div>
                </div>
              </th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody class="supplier-content">
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

  renderSupplier({
    sortAction: sortActionVal,
    sortName: sortNameVal,
    searching: searchingVal,
  });

  $('.header-input').keypress(async (e) => {
    if (e.keyCode !== 13) return;
    handleSearching(e.target.value, renderSupplier);
  });

  $('.btn-header').click(() => {
    handleSearching($('.header-input').val(), renderSupplier);
  });

  $('.supplier-header div').click(() => {
    if (!isAccessAction('suppliers', 'CREATE')) return;
    $('#createSupplierModal').modal('show');
  });

  $('.icon-sort').click((e) => {
    handleSorting(e, renderSupplier);
  });
}
