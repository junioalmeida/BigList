var formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BLR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});
var month = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

var screens;
var tabs;
var currentSubTab = 1;

var products = [];
var categories = [];
var mainListItens = [];

const initializeValues = () => {
    /*
    if (categories.length === 0) {
        categories.push(new Category('Eletrônicos', Colors.Green));
        categories.push(new Category('Móveis', Colors.Pink));
        categories.push(new Category('Alimentação', Colors.Blue));

        products.push(new Product('Celular', 1541.14, null, 0, 1));
        products.push(new Product('Sofá', 800.40, null, 200, 2));
        products.push(new Product('Televisão', 1520.40, null, 0, 1));
        products.push(new Product('Guarda-roupas', 400.40, null, 0, 2));
        products.push(new Product('Mesa', 100.20, null, 0, 2));
        products.push(new Product('Tablet', 1300.00, null, 14, 1));
        products.push(new Product('Maçã', 2.12, new Date('2021-09-20'), 100, 3));
        products.push(new Product('Laranja', 2.12, new Date('2019-09-20'), 100, 3));
        products.push(new Product('Melão', 2.12, new Date('2018-09-20'), 100, 3));
        products.push(new Product('Banana', 0.87, new Date('2022-09-16'), 12, 3));
        products.push(new Product('Pera', 0.87, new Date('2022-09-14'), 12, 3));
        products.push(new Product('Melancia', 0.87, new Date('2022-09-15'), 12, 3));
        products.push(new Product('Leite Condensado', 15.20, new Date('2022-09-30'), 25, 3));

        store();
    }*/

    showCategories();
};

/**
 * Função onload que inicializa a aplicação e insere códigos JS nos diversos componentes da aplicação
 */
onload = () => {

    screens = document.querySelectorAll("[id^='screen']");
    tabs = document.querySelectorAll("[id^='tab']");

    productId = (localStorage.getItem("big-list-currentProductId") ?
        JSON.parse(localStorage.getItem("big-list-currentProductId")) : 1);
    categoryId = (localStorage.getItem("big-list-currentCategoryId") ?
        JSON.parse(localStorage.getItem("big-list-currentCategoryId")) : 1);

    categories = (localStorage.getItem("big-list-categories") ?
        JSON.parse(localStorage.getItem("big-list-categories")) : []);
    products = (localStorage.getItem("big-list-products") ?
        JSON.parse(localStorage.getItem("big-list-products")) : []);

    products = products.map(i => {
        return new Product(i.name, i.price, (i.valid ? new Date(i.valid) : null),
            i.stored, i.codCategory, i.id);
    });

    categories = categories.map(i => {
        return new Category(i.name, i.color, i.id);
    });

    initializeValues();

    tabs[0].onclick = (e) => {
        showScreen('#screen1');
        activate(e.target);
    };

    tabs[1].onclick = (e) => {
        showScreen('#screen2');
        reloadTable();
        activate(e.target);
    };

    document.querySelector('#menu-categories').onclick = () => {
        activateSubTab(1);
        showCategories();
    };

    document.querySelector('#menu-products').onclick = () => {
        activateSubTab(2);
        showProducts();
    };

    document.querySelector('#menu-filter').onclick = () => {
        showScreen('#screen3');
        selectFilter('#filter-list-itens');
    };

    document.querySelector('#btn-confirm-filter').onclick = () => {
        applyFilter();
    };

    document.querySelector('#menu-sort').onclick = () => {
        showSortOptions(currentSubTab);
        showScreen('#screen6');
        selectFilter('#sort-list-itens');
    };

    document.querySelector('#btn-confirm-sort').onclick = () => {
        applySort();
    };

    document.querySelector('#btn-add-item').onclick = () => {
        if (currentSubTab === 1) {
            showCategoryScreen(false);
        } else {
            showProductScreen(false);
        }
    };

    document.querySelector('#btn-save-category').onclick = (e) => {
        saveCategory(e);
    };

    document.querySelector('#btn-save-product').onclick = (e) => {
        saveProduct(e);
    };

    document.querySelector('#btn-delete-product').onclick = (e) => {
        deleteProduct(e);
    };

    document.querySelector('#btn-delete-category').onclick = (e) => {
        deleteCategory(e);
    };
};

/**
 * Função que deleta uma categoria que é passada como parâmetro através do evento click.
 * @param {event} e Evento clique no botão de deletar que contém o id da categoria exibida na tela.
 */
const deleteCategory = (e) => {
    const anwser = confirm("Todos os produtos desta categoria serão deletados, deseja continuar?");

    if (anwser) {
        products = products.filter(p => {
            return p.codCategory !== parseInt(e.target.getAttribute('data-edit'));
        });

        const c = categories.find(c => {
            return c.id === parseInt(e.target.getAttribute('data-edit'));
        });

        categories.splice(categories.indexOf(c), 1)

        store();
        showScreen('#screen1');
        showCategories();
    }
};


/**
 * Função que deleta um produto que é passado como parâmetro através do evento click.
 * @param {event} e Evento clique no botão de deletar que contém o id do produto exibido na tela.
 */
const deleteProduct = (e) => {
    const p = products.find(p => {
        return p.id === parseInt(e.target.getAttribute('data-edit'));
    });

    products.splice(products.indexOf(p), 1);

    store();
    showScreen('#screen1');
    showProducts();
};

/**
 * Função que persiste todos os dados relevantes da aplicação no Local Storage.
 */
const store = () => {
    localStorage.setItem('big-list-currentProductId', JSON.stringify(productId));
    localStorage.setItem('big-list-currentCategoryId', JSON.stringify(categoryId));
    localStorage.setItem('big-list-products', JSON.stringify(products));
    localStorage.setItem('big-list-categories', JSON.stringify(categories));
};

/**
 * Função que armazena um produto e aplica todas as validações necessárias nos dados.
 * @param {event} e (Opcional) Evento clique no botão de salvar que contém o id do produto que será editado. 
 * Caso não seja informado é considerado uma inserção de um novo elemento.
 * @returns Null caso todas as validações não sejam cumpridas.
 */
const saveProduct = (e) => {
    const nameField = document.querySelector('#prod-name');
    const priceField = document.querySelector('#prod-price');
    const validField = document.querySelector('#prod-valid');
    const storedField = document.querySelector('#prod-stored');
    const categField = document.querySelector('#prod-categ');
    let isValid = true;

    if (nameField.value.length < 3) {
        validateField(nameField, false);
        isValid = false;
    } else {
        validateField(nameField, true);
    }

    if (!priceField.value) {
        validateField(priceField, false);
        isValid = false;
    } else {
        validateField(priceField, true);
    }

    if (!storedField.value) {
        validateField(storedField, false);
        isValid = false;
    } else {
        validateField(storedField, true);
    }

    if (categField.value.trim().length === 0) {
        validateField(categField, false);
        isValid = false;
    } else {
        validateField(categField, true);
    }

    if (isValid) {
        const id = parseInt(e.target.getAttribute('data-edit'));
        const newProduct = new Product(nameField.value, parseFloat(priceField.value),
            (validField.value ? new Date(validField.value) : null), parseFloat(storedField.value), parseInt(categField.value));

        if (id) {
            const index = products.indexOf(products.find(p => {
                return p.id === id;
            }));
            newProduct.id = id;
            products[index] = newProduct;
            productId--;
        } else {
            products.push(newProduct);
        }

        store();
        showProducts();
        showScreen('#screen1');
    } else {
        return;
    }

};

/**
 * Função que armazena uma categoria e aplica todas as validações necessárias nos dados.
 * @param {event} e (Opcional) Evento clique no botão de salvar que contém o id da categoria que será editada. 
 * Caso não seja informado é considerado uma inserção de um novo elemento.
 * @returns Null caso todas as validações não sejam cumpridas.
 */
const saveCategory = (e) => {
    const nameField = document.querySelector('#categ-name');
    const colorFiled = document.querySelector('#categ-color');
    let isValid = true;

    if (nameField.value.length < 3) {
        validateField(nameField, false);
        isValid = false;
    } else {
        validateField(nameField, true);
    }

    if (colorFiled.value.trim().length === 0) {
        validateField(colorFiled, false);
        isValid = false;
    } else {
        validateField(colorFiled, true);
    }

    if (isValid) {
        const id = parseInt(e.target.getAttribute('data-edit'));
        const newCategory = new Category(nameField.value, colorFiled.value);

        if (id) {
            const index = categories.indexOf(categories.find(p => {
                return p.id === id;
            }));
            newCategory.id = id;
            categories[index] = newCategory;
            categoryId--;
        } else {
            categories.push(newCategory);
        }

        store();
        showCategories();
        showScreen('#screen1');
    } else {
        return;
    }
};

/**
 * Função que remove e/ou adiciona classes css de validação de modo a fornecer uma visualização ao usuário dos campos não preenchidos corretamente.
 * @param {Element} field Elemento do campo que será editado.
 * @param {boolean} isValid Indica se o campo é válido ou inválido para aplicar corretamente o css.
 */
const validateField = (field, isValid) => {

    if (!isValid) {
        field.classList.remove('valid');
        field.classList.add('invalid');
    } else {
        field.classList.remove('invalid');
        field.classList.add('valid');
    }
};

/**
 * Função que prepara a tela de produto para adição ou atualização.
 * @param {boolean} isEdit Indica se é uma operação de edição ou inserção.
 * @param {event} e (Opcional) Evento clique no item da lista. Deve ser fornecido apenas se for edição. 
 */
const showProductScreen = (isEdit, e) => {

    clearForm('#form-product');

    document.querySelector('#btn-cancel-product').onclick = () => {
        showScreen('#screen1');
    };

    const categField = document.querySelector('#prod-categ');

    categories.forEach(c => {
        let option = document.createElement('option');
        option.textContent = c.name;
        option.value = c.id;
        categField.appendChild(option);
    });

    if (isEdit) {
        document.querySelector('#btn-delete-product').classList.remove('hidden');
        document.querySelector('#btn-delete-product').setAttribute('data-edit', e.target.getAttribute('data-id'));
        document.querySelector('#btn-save-product').setAttribute('data-edit', e.target.getAttribute('data-id'));

        const item = mainListItens.find(i => {
            return i.id === parseInt(e.target.getAttribute('data-id'));
        });

        document.querySelector('#prod-name').value = item.name;
        document.querySelector('#prod-price').value = item.price;
        document.querySelector('#prod-valid').value = (item.valid ? `${item.valid.getFullYear()}-${month[item.valid.getMonth()]}-${item.valid.getDate()}` : null);
        document.querySelector('#prod-stored').value = item.stored;
        document.querySelector('#prod-categ').value = item.codCategory;
    } else {
        document.querySelector('#btn-delete-product').classList.add('hidden');
        document.querySelector('#btn-save-product').removeAttribute('data-edit');
        document.querySelector('#btn-delete-product').removeAttribute('data-edit');
    }

    showScreen('#screen5');
};

/**
 * Função que prepara a tela de categoria para adição ou atualização.
 * @param {boolean} isEdit Indica se é uma operação de edição ou inserção.
 * @param {event} e (Opcional) Evento clique no item da lista. Deve ser fornecido apenas se for edição. 
 */
const showCategoryScreen = (isEdit, e) => {

    clearForm('#form-category');

    document.querySelector('#btn-cancel-category').onclick = () => {
        showScreen('#screen1');
    };

    if (isEdit) {
        document.querySelector('#btn-delete-category').classList.remove('hidden');
        document.querySelector('#btn-delete-category').setAttribute('data-edit', e.target.getAttribute('data-id'));
        document.querySelector('#btn-save-category').setAttribute('data-edit', e.target.getAttribute('data-id'));

        const item = mainListItens.find(i => {
            return i.id === parseInt(e.target.getAttribute('data-id'));
        });

        document.querySelector('#categ-name').value = item.name;
        document.querySelector('#categ-color').value = item.color;
    } else {
        document.querySelector('#btn-delete-category').classList.add('hidden');
        document.querySelector('#btn-delete-category').removeAttribute('data-edit');
        document.querySelector('#btn-save-category').removeAttribute('data-edit');
    }

    showScreen('#screen4');
};

/**
 * Função que efetua uma limpeza de todos os campos de um formulário.
 * @param {string} idForm Id do dormulário que deve ter seus campos resetados.
 */
const clearForm = (idForm) => {
    let inputItens = document.querySelectorAll(`${idForm} input, ${idForm} select`);

    inputItens.forEach(i => {
        i.value = '';
        i.classList.remove('valid');
        i.classList.remove('invalid');
    });

    inputItens = document.querySelector(`${idForm} #prod-categ`);
    
    if (inputItens) {
        let child = inputItens.lastElementChild;
        
        while (child && child.value !== '') {
            inputItens.removeChild(child);
            child = inputItens.lastElementChild;
        }
    }
};

/**
 * Função que atualiza a tabela de relatório e recalcula todos os valores.
 */
const reloadTable = () => {
    const elementTbody = document.querySelector('#table-inventory tbody');

    let child = elementTbody.lastElementChild;
    while (child) {
        elementTbody.removeChild(child);
        child = elementTbody.lastElementChild;
    }

    let totalProducts = 0;
    let totalValue = 0;

    let elementTr;
    let elementTd;

    categories.forEach(c => {
        let totalStored = 0;
        let totalPrice = 0;

        elementTr = document.createElement('tr');
        elementTd = document.createElement('td');
        elementTd.textContent = c.name;
        elementTr.appendChild(elementTd);

        products.map(p => {
            if (p.codCategory === c.id) {
                totalPrice += p.stored * p.price;
                totalStored += p.stored;
            }
        });

        elementTd = document.createElement('td');
        elementTd.textContent = totalStored;
        elementTr.appendChild(elementTd);

        elementTd = document.createElement('td');
        elementTd.textContent = formatter.format(totalPrice);
        elementTr.appendChild(elementTd);

        totalProducts += totalStored;
        totalValue += totalPrice;
        elementTbody.appendChild(elementTr);
    });

    elementTr = document.createElement('tr');
    elementTr.classList.add('total-line');

    elementTd = document.createElement('td');
    elementTd.textContent = 'TOTAL';
    elementTr.appendChild(elementTd);

    elementTd = document.createElement('td');
    elementTd.textContent = totalProducts;
    elementTr.appendChild(elementTd);

    elementTd = document.createElement('td');
    elementTd.textContent = formatter.format(totalValue);
    elementTr.appendChild(elementTd);

    elementTbody.appendChild(elementTr);
};

/**
 * Função que aplica uma determinada ordenação selecionada na lista que estiver em exibição.
 */
const applySort = () => {
    let option = document.querySelector('#sort-list-itens .selected');

    if (option) {
        option = parseInt(option.id.substring(0, 1));
    }

    switch (option) {
        /*Products*/
        case 1:
            mainListItens.sort((a, b) => {
                return a.name.localeCompare(b.name);
            });

            break;
        case 2:
            mainListItens.sort((a, b) => {
                return a.valid - b.valid;
            });

            break;
        case 3:
            mainListItens.sort((a, b) => {
                return b.stored - a.stored;
            });

            break;

        /*Categories*/
        case 4:
            mainListItens.sort((a, b) => {
                return a.name.localeCompare(b.name);
            });

            break;
        case 5:
            mainListItens.sort((a, b) => {
                let totalA = 0, totalB = 0;

                products.map(p => {
                    if (p.codCategory === a.id) {
                        totalA += p.stored * p.price;
                    } else if (p.codCategory === b.id) {
                        totalB += p.stored * p.price;
                    }
                });

                return totalB - totalA;
            });

            break;
    }

    showScreen('#screen1');
    showList('#main-list-itens');
};

/**
 * Função que exibe as opções de ordenação da lista em exibição.
 * @param {number} subTab Indica o sub menu selecionado atualmente (Categoria ou Produto).
 * @returns Null caso o parâmetro subTab seja diferente de 1 ou 2.
 */
const showSortOptions = (subTab) => {
    if (subTab === 1) {
        document.querySelector('#title-sort').textContent = 'Ordernar ' + 'Categorias';
    } else {
        document.querySelector('#title-sort').textContent = 'Ordernar ' + 'Produtos';
    }

    const sortList = document.querySelector('#sort-list-itens');

    for (let i = 0; i < sortList.children.length; i++) {
        sortList.children[i].classList.remove('hidden');
    }

    if (subTab === 1) {
        const productOptions = document.querySelectorAll('[data-menu="product"]');

        for (let i = 0; i < productOptions.length; i++) {
            productOptions[i].classList.add('hidden');
        }
    } else if (subTab === 2) {
        const productOptions = document.querySelectorAll('[data-menu="category"]');

        for (let i = 0; i < productOptions.length; i++) {
            productOptions[i].classList.add('hidden');
        }
    } else {
        return;
    }
};

/**
 * Função que aplica um determinado filtro sob APENAS a lista de produtos.
 */
const applyFilter = () => {
    let option = document.querySelector('#filter-list-itens .selected');

    if (option) {
        option = parseInt(option.id.substring(0, 1));
        mainListItens = [];
    }

    let today = new Date();

    switch (option) {
        case 1:
            mainListItens = products.filter(p => {
                return p.valid !== null && p.valid < today;
            })

            mainListItens.sort((a, b) => {
                return a.valid - b.valid;
            })

            break;
        case 2:
            let maxDate = new Date();
            maxDate.setDate(today.getDate() + 7);

            mainListItens = products.filter(p => {
                return p.valid !== null && p.valid > today && p.valid < maxDate;
            })

            mainListItens.sort((a, b) => {
                return a.valid - b.valid;
            })
            break;
        case 3:
            mainListItens = products.filter(p => {
                return p.stored === 0;
            })
            break;
    }

    if (option) {
        mainListItens = mainListItens.map(i => {
            return mountProductObj(i);
        });

        activateSubTab(2);
    }

    showScreen('#screen1');
    showList('#main-list-itens');
};

/**
 * Função que prepara uma lista de seleção única, de modo a não permitir a seleção de mais de um elemento.
 * @param {string} listId Id da lista que será selecionada.
 */
const selectFilter = (listId) => {
    const list = document.querySelector(listId);

    for (let i = 0; i < list.children.length; i++) {
        list.children[i].classList.remove('selected');

        list.children[i].onclick = (e) => {

            for (let j = 0; j < list.children.length; j++) {
                if (list.children[j] !== e.target) {
                    list.children[j].classList.remove('selected')
                }
            }

            if (e.target.classList.contains('selected')) {
                e.target.classList.remove('selected');
            } else {
                e.target.classList.add('selected');
            }
        };
    }

};

/**
 * Função que exibe a tela de produtos juntamente com todos os produtos cadastrados aplicando uma ordenação padrão.
 */
const showProducts = () => {
    mainListItens = [];
    products.forEach((p) => {
        const item = mountProductObj(p);
        mainListItens.push(item);
    });

    mainListItens.sort((a, b) => {
        return a.color.localeCompare(b.color) || a.name.localeCompare(b.name);
    });

    showList('#main-list-itens');
    activateSubTab(2);
};

/**
 * Função que exibe a tela de categorias juntamente com todos as categorias cadastrados aplicando uma ordenação padrão.
 */
const showCategories = () => {
    mainListItens = [];
    categories.forEach((c) => {
        mainListItens.push({ nameToShow: c.name, name: c.name, color: c.color, id: c.id });
    });

    mainListItens.sort((a, b) => {
        return a.color.localeCompare(b.color) || a.name.localeCompare(b.name);
    });

    showList('#main-list-itens');
    activateSubTab(1);
};

/**
 * Função que popula e formata uma lista com todos os itens que estejam em um array padrão e exibe esta lista na tela.
 * @param {string} id Id da lista que deverá ser populada e exibida.
 */
const showList = (id) => {
    const listItens = document.querySelector(id);

    let child = listItens.lastElementChild;
    while (child) {
        listItens.removeChild(child);
        child = listItens.lastElementChild;
    }

    if(mainListItens.length === 0) {
        document.querySelector('#blank').classList.remove('hidden');
        listItens.classList.add('hidden');
    } else {
        document.querySelector('#blank').classList.add('hidden');
        listItens.classList.remove('hidden');
    }

    mainListItens.forEach(i => {
        const item = mountListItem(i.nameToShow, i.color, i.id);
        listItens.appendChild(item);
    });
};

/**
 * Função interna que monta um objeto de produto com alguns atributos necessários para a renderização do produto.
 * @param {Product} p Produto que será montado em um objeto.
 * @returns {Object} Retorna o objeto montado de acordo com o parâmetro informado.
 */
const mountProductObj = (p) => {
    const color = categories.find(e => { return e.id === p.codCategory; }).color;
    return { id: p.id, name: p.name, nameToShow: p.mountString(), color: color, valid: p.valid, stored: p.stored, price: p.price, codCategory: p.codCategory };
};

/**
 * Função interna que monta um elemento <li> completo e com todos os sub-elements, classes e atributos necessários.
 * @param {string} text Texto do item.
 * @param {Colors} Colors Cor do item.
 * @param {number} id Id do item.
 * @returns {Element} Retorna um item li completamente montado e pronto para exibição.
 */
const mountListItem = (text, Colors, id) => {
    const elementLi = document.createElement('li');

    const elementDivColor = document.createElement('div');
    elementDivColor.classList.add('div-color');
    elementDivColor.classList.add(Colors);
    elementDivColor.setAttribute('data-id', id);

    const elementDivContent = document.createElement('div');
    elementDivContent.classList.add('div-content');
    elementDivContent.textContent = text;
    elementDivContent.setAttribute('data-id', id);

    const elementDivListItem = document.createElement('div');
    elementDivListItem.classList.add('list-item');
    elementDivListItem.appendChild(elementDivColor);
    elementDivListItem.appendChild(elementDivContent);
    elementDivListItem.setAttribute('data-id', id);

    elementLi.onclick = (e) => {
        if (currentSubTab === 1) {
            showCategoryScreen(true, e);
        } else {
            showProductScreen(true, e);
        }
    };

    elementLi.setAttribute('data-id', id);
    elementLi.appendChild(elementDivListItem);

    return elementLi;
};

/**
 * Função que ativa um sub menu alterando suas classes e desabilitando a opção de filtragem para categorias.
 * @param {number} menu Número do sub menu a ser exibido 1- Categorias ou 2- Produtos.
 */
const activateSubTab = (menu) => {

    const menuProducts = document.querySelector('#menu-products');
    const menuCategories = document.querySelector('#menu-categories');

    if (menu === 2) {
        menuProducts.classList.remove('light');
        menuProducts.classList.add('dark');
        menuCategories.classList.remove('dark');
        menuCategories.classList.add('light');
        document.querySelector('#menu-filter').disabled = false;
        currentSubTab = 2;
    } else {
        menuProducts.classList.add('light');
        menuProducts.classList.remove('dark');
        menuCategories.classList.add('dark');
        menuCategories.classList.remove('light');
        document.querySelector('#menu-filter').disabled = true;
        currentSubTab = 1;
    }
}

/**
 * Função que oculta todas as demais telas da aplicação que não a que for passada como parâmetro.
 * @param {string} screenName Nome da tela que deverá ser exibida. Este parâmetro deve ser informado no formato: '#nomeDaTela'.
 */
const showScreen = (screenName) => {

    screens.forEach(c => {
        c.classList.add("hidden");
    });

    const screen = document.querySelector(screenName);

    screen.classList.remove("hidden");
};

/**
 * Função que ativa um menu principal.
 * @param {Element} element Elemento do menu que derá ser ativiado.
 */
const activate = (element) => {

    let brothers = element.parentNode.children;

    for (let i = 0; i < brothers.length; i++) {

        brothers[i].classList.remove("active");
    }

    element.classList.add("active");
};

/**
 * Class Product
 */
var productId;

class Product {
    constructor(name, price, valid, stored, codCategory, id) {
        
        this.name = name;
        this.price = price;
        this.valid = valid;
        this.stored = stored;
        this.codCategory = codCategory;

        if (id) {
            this.id = id;
        } else {
            this.id = productId;
            productId++;
        }
    }

    mountString() {
        let str = `${this.name} - ${this.stored}`;

        if (this.valid) {
            str += ' - ' + this.valid.toLocaleDateString('pt-BR');
        }
        return str;
    };
};


/**
 * Class Category
 */
var categoryId;

const Colors = {
    'Blue': 'blue',
    'Pink': 'pink',
    'Green': 'green',
    'Red': 'red',
    'Yellow': 'yellow',
    'Black': 'black',
    'Purple': 'purple`'
}

class Category {
    constructor(name, color, id) {
        this.id = categoryId;
        this.name = name;
        this.color = color;

        if (id) {
            this.id = id;
        } else {
            this.id = categoryId;
            categoryId++;
        }
    }
};