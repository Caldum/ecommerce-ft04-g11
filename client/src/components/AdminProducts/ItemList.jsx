import Edit from './Edit';
import { connect } from 'react-redux';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ConfirmDelete from './ConfirmDelete';
import { Button } from 'react-bootstrap';
import { switchLoading } from '../../actions/global';
import { FiTrash2, FiEdit3, FiExternalLink } from 'react-icons/fi';
import { deleteProduct, updateProduct, getProducts, addCategoryToProduct, deleteCategoryToProduct } from '../../actions/products';
// import { getProducts, deleteProduct, updateProduct, addCategoryToProduct, deleteCategoryToProduct } from '../../actions/products';


function ItemList({ product, deleteProduct, updateProduct, switchLoading, getProducts, page, allCategories, addCategoryToProduct, deleteCategoryToProduct }) {
    const { id, name, categories, stock, price, images } = product;
    const image = JSON.parse(images)[0];

    const [state, setState] = useState({
        editing: false,
        deleting: false
    });

    const handleEditing = () => {
        setState({
            ...state,
            editing: !state.editing
        })
    }


    const handleDeleting = () => {
        setState({
            ...state,
            deleting: !state.deleting
        })
    }

    const handleDelete = () => {

        handleDeleting();
        return id => {
            // switchLoading(true);
            deleteProduct(id).then(() => {
                document.location.reload();
            });
        };
    }

    const handleUpdate = () => {
        handleEditing();
        // switchLoading(true);
        return (id, attributes) => {
            for (let item of attributes.categories) {
                addCategoryToProduct(item, id);
            }
            for (let item of attributes.categoriesToDelete) {
                deleteCategoryToProduct(item, id);
            }
            updateProduct(id, attributes).then(() => {
                document.location.reload();
            });

        }
    }

    return (
        <tr className="text-center">
            <ConfirmDelete deleteProduct={handleDelete} product={{ id, name, image }} show={state.deleting} handleClose={handleDeleting} />
            <Edit allCategories={allCategories} updateProduct={handleUpdate} show={state.editing} product={product} handleClose={handleEditing} />
            <td className="align-middle" width="70">
                <img alt={'Imagen del producto' + name} width="64" className="img-thumbnail" src={image} />
            </td>
            <td className="align-middle">{name}</td>
            <td className="align-middle" style={{ maxWidth: "100px" }}>{categories && categories.length > 0 ? categories.map(category => (
                <span key={category.id} className="badge badge-secondary" style={{ margin: "3px" }}>{category.name}</span>
            )) : <span>Sin categorías</span>}</td>
            <td className="align-middle">{stock}</td>
            <td className="align-middle">{price}</td>
            <td className="align-middle">
                <Link to={"/productos/" + id} className="m-1 btn btn-light btn-sm" title="Ver en el catálogo"><FiExternalLink /></Link>
                <Button size="sm" onClick={handleEditing} className="m-1" title="Modificar" variant="warning"><FiEdit3 /></Button>
                <Button size="sm" onClick={handleDeleting} className="m-1" title="Borrar" variant="danger"><FiTrash2 /></Button>
            </td>
        </tr>
    );
}

function mapStateToProps(state) {
    return {
        allCategories: state.categoriesReducer.categories,
    }
}


function mapDispatchToProps(dispatch) {
    return {
        //getCategories: () => dispatch(getCategories()),
        deleteProduct: (id) => dispatch(deleteProduct(id)),
        addCategoryToProduct: (idCat, idProduct) => dispatch(addCategoryToProduct(idCat, idProduct)),
        deleteCategoryToProduct: (idCat, idProduct) => dispatch(deleteCategoryToProduct(idCat, idProduct)),
        updateProduct: (idProduct, attributes) => dispatch(updateProduct(idProduct, attributes)),
        switchLoading: (isLoading) => dispatch(switchLoading(isLoading)),
        getProducts: () => dispatch(getProducts())

    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ItemList);