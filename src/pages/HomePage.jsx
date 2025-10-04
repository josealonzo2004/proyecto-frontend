import { Brands } from "../components/home/Brands";
import { FeatureGrid } from "../components/home/FeatureGrid";
import { ProductGrid } from "../components/home/ProductGrid";

export const HomePage = () => {
    return (
        <div>
            <FeatureGrid />

            <ProductGrid
                title='nuevos productoz' 
                products={[{id: 1, title: 'Producto 1'}]}
            />

            <ProductGrid
                title='productos destacados' 
                products={[{id: 1, title: 'Producto producto destacado'}]}
            />

             <Brands />
        </div>

       
    );
};