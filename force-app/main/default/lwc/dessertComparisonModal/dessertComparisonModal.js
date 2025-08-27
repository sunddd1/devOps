/**
 * @description       : 
 * @author            : 
 * @group             : 
 * @last modified on  : 08-27-2025
 * @last modified by  :  
 * Modifications Log
 * Ver   Date         Author   Modification
 * 1.0   08-27-2025      Initial Version
**/
import LightningModal from 'lightning/modal';
import getDessertProducts from '@salesforce/apex/DessertProductController.getDessertProducts';

export default class DessertComparisonModal extends LightningModal {
    products;
    error;

    connectedCallback() {
        getDessertProducts()
            .then((result) => {
                this.products = result.map((pb) => ({
                    id: pb.Id,
                    name: pb.Product2?.Name,
                    categoryName: 'Bread',
                    price: pb.UnitPrice
                }));
            })
            .catch((error) => {
                this.error = error;
            });
    }

    disconnectedCallback() {
        console.log('닫힘');
    }

    get priceDifference() {
        if (this.products && this.products.length === 2) {
            return Math.abs(this.products[0].price - this.products[1].price);
        }
        return null;
    }

    handleClose() {
        this.close();
    }
}