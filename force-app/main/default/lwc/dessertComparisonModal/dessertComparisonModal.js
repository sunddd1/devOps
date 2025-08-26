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
