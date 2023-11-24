import brandApi from '../api/brandApi';
import uploadApi from '../api/uploadApi';
import { handleSearching, handleSorting } from './manager';
import { isAccessAction, renderLoadingManager, urlServer } from '../utils/constains';
import { toast } from '../utils/toast';
import { validation } from '../utils/validation';

async function renderBrand(params = '') {
  try {
    const { data: brandList } = await brandApi.getAll(params);

    if (brandList.length <= 0) {
      $('.brand-content').html(`
        <tr>
          <td colspan="3">
            <h1 class="text-center my-5 w-100">Không có nhóm quyền nào cả!!!</h1>  
          </td>
        </tr>
      `);
      return;
    }

    const brandHTML = brandList
      .map(
        (brand) => `
        <tr align="center">
          <td>
            <div class="brand-info">
              <div class="brand-icon">
                <img src="${urlServer}/images/${brand['icon']}" alt="${brand['ten_thuong_hieu']}" />
              </div>
              <span>${brand['ten_thuong_hieu']}</span>
            </div>
          </td>
          <td>
            <div class="brand-img">
              <img src="${urlServer}/images/${brand['hinh_anh']}" alt="${brand['ten_thuong_hieu']}" />
            </div>
          </td>
          <td>
            <div class="d-flex justify-content-center align-items-center gap-2">
              <i class="fa-solid fa-pen-to-square admin-action edit" data-id="${brand['ma_thuong_hieu']}"></i>
              <i class="fa-solid fa-trash admin-action remove text-danger" data-id="${brand['ma_thuong_hieu']}"></i>
            </div>
          </td>
        </tr>
      `
      )
      .join();

    $('.brand-content').html(brandHTML);

    $('.brand .admin-action.remove').click((e) => {
      if (!isAccessAction('brands', 'DELETE')) return;

      $('#deleteBrandModal').modal('show');
      $('#deleteBrandModal').attr('data-id', e.target.dataset.id);
    });

    $('.brand .admin-action.edit').click(async (e) => {
      if (!isAccessAction('brands', 'UPDATE')) return;

      try {
        const id = e.target.dataset.id;
        const data = await brandApi.getById(id);

        $('#update_brandName').val(data['ten_thuong_hieu']);
        $('label[for="update_icon"] img').attr('src', urlServer + '/images/' + data['icon']);
        $('label[for="update_brandImage"] img').attr(
          'src',
          urlServer + '/images/' + data['hinh_anh']
        );

        $('#updateBrandModal').modal('show');
        $('#updateBrandModal').attr('data-id', id);
      } catch (error) {
        console.log(error.message);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
}

function displayImagePreview(e, id, element) {
  const [file] = e.target.files;
  if (file) {
    $(`${id} .image-input${element} img`).attr('src', URL.createObjectURL(file));
  }
}

function showRemoveImageIcon(id, element) {
  const src = $(`${id} .image-input${element} img`).attr('src');

  if (src !== '/img.webp') {
    $(`${id} .image-input${element} .icon-remove`).addClass('show');
  }
}

function hideRemoveImageIcon(id, element) {
  $(`${id} .image-input${element} .icon-remove`).removeClass('show');
}

function handleClickRemoveImage(e, id, element) {
  e.preventDefault();
  $(`${id} .image-input${element} img`).attr('src', '/img.webp');
  $(`${id} .image-input${element} input`)[0].files = null;
}

$('#create_brandImage').change((e) => {
  displayImagePreview(e, '#createBrandModal', '.image-background');
});

$('#update_brandImage').change((e) => {
  displayImagePreview(e, '#updateBrandModal', '.image-background');
});

$('#create_icon').change((e) => {
  displayImagePreview(e, '#createBrandModal', '.image-icon');
});

$('#update_icon').change((e) => {
  displayImagePreview(e, '#updateBrandModal', '.image-icon');
});

$('#updateBrandModal .image-input.image-background').mouseenter(() => {
  showRemoveImageIcon('#updateBrandModal', '.image-background');
});
$('#createBrandModal .image-input.image-background').mouseenter(() => {
  showRemoveImageIcon('#createBrandModal', '.image-background');
});

$('#updateBrandModal .image-input.image-icon').mouseenter(() => {
  showRemoveImageIcon('#updateBrandModal', '.image-icon');
});
$('#createBrandModal .image-input.image-icon').mouseenter(() => {
  showRemoveImageIcon('#createBrandModal', '.image-icon');
});

$('#updateBrandModal .image-input.image-background').mouseleave(() => {
  hideRemoveImageIcon('#updateBrandModal', '.image-background');
});
$('#createBrandModal .image-input.image-background').mouseleave(() => {
  hideRemoveImageIcon('#createBrandModal', '.image-background');
});

$('#updateBrandModal .image-input.image-icon').mouseleave(() => {
  hideRemoveImageIcon('#updateBrandModal', '.image-icon');
});
$('#createBrandModal .image-input.image-icon').mouseleave(() => {
  hideRemoveImageIcon('#createBrandModal', '.image-icon');
});

$('#updateBrandModal .image-icon .icon-remove').click((e) => {
  handleClickRemoveImage(e, '#updateBrandModal', '.image-icon');
});
$('#createBrandModal .image-icon .icon-remove').click((e) => {
  handleClickRemoveImage(e, '#createBrandModal', '.image-icon');
});

$('#updateBrandModal .image-background .icon-remove').click((e) => {
  handleClickRemoveImage(e, '#updateBrandModal', '.image-background');
});
$('#createBrandModal .image-background .icon-remove').click((e) => {
  handleClickRemoveImage(e, '#createBrandModal', '.image-background');
});

$('#updateBrandModal .btn-update').click(async () => {
  if (!isAccessAction('brands', 'UPDATE')) return;

  try {
    const input = Array.from($('#updateBrandModal input'));
    let isValid = true;

    input.forEach((item) => {
      if (validation(item)) {
        isValid = false;
      }
    });

    if (!isValid) {
      return;
    }

    const id = $('#updateBrandModal').attr('data-id');
    const brandName = $('#update_brandName').val();

    const [fileImage] = $('#update_brandImage')[0].files;
    const [fileIcon] = $('#update_icon')[0].files;

    const formData = new FormData();
    const data = {
      ma_thuong_hieu: id,
      ten_thuong_hieu: brandName.charAt(0).toUpperCase() + brandName.slice(1),
    };

    if ($('#update_brandImage')[0].files.length > 0) {
      formData.append('uploadfile', fileImage);
      data['hinh_anh'] = fileImage.name;
      await uploadApi.add(formData);
    }

    if ($('#update_icon')[0].files.length > 0) {
      formData.append('uploadfile', fileIcon);
      data['icon'] = fileIcon.name;
      await uploadApi.add(formData);
    }

    await brandApi.update(data);

    toast({
      title: 'Thay đổi thương hiệu thành công',
      type: 'success',
      duration: 2000,
    });

    renderBrand();
  } catch (error) {
    toast({
      title: 'Thay đổi thương hiệu không thành công',
      message: error.message,
      type: 'error',
      duration: 2000,
    });
  } finally {
    $('#updateBrandModal').modal('hide');
  }
});

$('#createBrandModal .btn-create').click(async () => {
  if (!isAccessAction('brands', 'CREATE')) return;

  const input = Array.from($('#createBrandModal input'));
  let isValid = true;

  input.forEach((item) => {
    if (validation(item)) {
      isValid = false;
    }
  });

  if (!isValid) {
    return;
  }

  const brandName = $('#create_brandName').val();
  const [fileImage] = $('#create_brandImage')[0].files;
  const [fileIcon] = $('#create_icon')[0].files;

  const formImageData = new FormData();
  const formIconData = new FormData();
  formImageData.append('uploadfile', fileImage);
  formIconData.append('uploadfile', fileIcon);

  try {
    await brandApi.add({
      ten_thuong_hieu: brandName.charAt(0).toUpperCase() + brandName.slice(1),
      icon: fileIcon.name,
      hinh_anh: fileImage.name,
    });

    await uploadApi.add(formImageData);
    await uploadApi.add(formIconData);

    toast({
      title: 'Thêm thương hiệu thành công',
      type: 'success',
      duration: 2000,
    });

    renderBrand();
  } catch (error) {
    toast({
      title: 'Thêm thương hiệu không thành công',
      message: error.message,
      type: 'error',
      duration: 2000,
    });
  } finally {
    $('#createBrandModal').modal('hide');
  }
});

$('#deleteBrandModal .btn-yes').click(async () => {
  if (!isAccessAction('brands', 'DELETE')) return;

  try {
    const id = $('#deleteBrandModal').attr('data-id');

    await brandApi.remove(id);

    toast({
      title: 'Xóa thương hiệu không thành công',
      type: 'success',
      duration: 2000,
    });

    renderBrand();
  } catch (error) {
    toast({
      title: 'Xóa thương hiệu không thành công',
      message: error.message,
      type: 'error',
      duration: 2000,
    });
  } finally {
    $('#deleteBrandModal').modal('hide');
  }
});

export function renderBrandPage() {
  const loadingHTML = renderLoadingManager(18, 3);

  $('.admin-content').html(`
    <div class="brand">
      <div class="brand-header">
        <h1>Thương hiệu</h1>
        <div>
          <i class="fa-solid fa-circle-plus"></i> thêm thương hiệu
        </div>
      </div>
      <div class="search-container">
        <div class="search-box">
          <input type="text" class="header-input" placeholder="Tìm kiếm theo tên thương hiệu" />
          <button type="button" class="btn primary btn-header">
            <i class="fa-solid fa-magnifying-glass"></i>
          </button>
        </div>
      </div>
      <div class="brand-table-container">
        <table class="brand-table">
          <thead>
            <tr align="center">
              <th>
                <div class="d-flex align-items-center justify-content-center gap-3 ">
                  Thương hiệu
                  <div class="icon-sort active before" data-value="ten_thuong_hieu" data-sort="desc"></div>
                </div>
              </th>
              <th>Hình ảnh</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody class="brand-content">
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

  renderBrand({
    sortAction: sortActionVal,
    sortName: sortNameVal,
    searching: searchingVal,
  });

  $('.brand-header div').click(() => {
    if (!isAccessAction('brands', 'CREATE')) return;
    $('#createBrandModal').modal('show');
  });

  $('.header-input').keypress(async (e) => {
    if (e.keyCode !== 13) return;

    handleSearching(e.target.value, renderBrand);
  });

  $('.btn-header').click(() => {
    handleSearching($('.header-input').val(), renderBrand);
  });

  $('.icon-sort').click((e) => {
    handleSorting(e, renderBrand);
  });
}
