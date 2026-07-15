import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import { Filter, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FALLBACK_PRODUCT_IMAGE, resolveProductImage } from '../utils/productImage';

export default function Products() {
    const { addItem } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [addingProductId, setAddingProductId] = useState(null);
    const [addedProductId, setAddedProductId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 8;
    
    const location = useLocation();
    const searchQuery = new URLSearchParams(location.search).get('search') || '';

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');

    const fallbackProducts = [
        { id: 1, name: 'Coolant Radiator Fluid', price: 94.95, category: 'Engine Parts', brand: 'Peak', stock: 15, sku: 'CRF-001' },
        { id: 2, name: 'Serpentine Belt', price: 229.95, category: 'Engine Parts', brand: 'Gates', stock: 8, sku: 'SB-002' },
        { id: 3, name: 'Shock Absorber', price: 750, category: 'Suspension', brand: 'KYB', stock: 12, sku: 'SA-003' },
        { id: 4, name: 'Brake Rotor', price: 299.99, category: 'Brake Systems', brand: 'Brembo', stock: 20, sku: 'BR-004' },
        { id: 5, name: 'Air Filter', price: 145.50, category: 'Engine Parts', brand: 'Bosch', stock: 0, sku: 'AF-005' },
        { id: 6, name: 'Spark Plugs', price: 89.99, category: 'Engine Parts', brand: 'NGK', stock: 25, sku: 'SP-006' },
    ];

    const parsePrice = (value) => {
        const numeric = typeof value === 'string' ? parseFloat(value) : Number(value);
        return Number.isFinite(numeric) ? numeric : 0;
    };

    const parseStock = (value) => {
        const numeric = typeof value === 'string' ? parseInt(value, 10) : Number(value);
        return Number.isFinite(numeric) ? numeric : 0;
    };

    const normalizeProduct = (item, index) => {
        const categoryName = item?.category?.name || item?.category_name || item?.category || 'General';
        return {
            id: item?.id ?? `temp-${index}`,
            name: item?.name || 'Unnamed Product',
            sku: item?.sku || item?.slug || '',
            brand: item?.brand || item?.manufacturer || 'Unknown',
            category: categoryName,
            price: parsePrice(item?.price ?? item?.selling_price ?? item?.amount),
            stock: parseStock(item?.stock ?? item?.quantity ?? item?.inventory),
            images: item?.images || item?.image_url || item?.image || null,
        };
    };

    const extractProductsArray = (response) => {
        const candidates = [
            response?.data?.data?.data,
            response?.data?.data?.products,
            response?.data?.products,
            response?.data?.data,
            response?.data,
            response,
        ];

        for (const candidate of candidates) {
            if (Array.isArray(candidate)) {
                return candidate;
            }
            if (candidate && typeof candidate === 'object') {
                for (const value of Object.values(candidate)) {
                    if (Array.isArray(value)) {
                        return value;
                    }
                }
            }
        }

        return [];
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await productService.getAll({ per_page: 1000 });
                const extracted = extractProductsArray(res);
                const normalized = extracted.map(normalizeProduct).filter((item) => item.name);
                setProducts(normalized.length > 0 ? normalized : fallbackProducts);
            } catch (err) {
                setProducts(fallbackProducts);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const categories = useMemo(() => {
        const names = new Set(products.map((item) => item.category).filter(Boolean));
        return Array.from(names).sort();
    }, [products]);

    const brands = useMemo(() => {
        const names = new Set(products.map((item) => item.brand).filter(Boolean));
        return Array.from(names).sort();
    }, [products]);

    // Apply filters
    useEffect(() => {
        let filtered = products;

        // Category filter
        if (selectedCategory) {
            filtered = filtered.filter((p) => (p.category?.name || p.category) === selectedCategory);
        }

        // Brand filter
        if (selectedBrand) {
            filtered = filtered.filter((p) => p.brand === selectedBrand);
        }

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter((p) =>
                p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredProducts(filtered);
    }, [products, selectedCategory, selectedBrand, searchQuery]);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, selectedBrand, searchQuery]);

    const handleResetFilters = () => {
        setSelectedCategory('');
        setSelectedBrand('');
    };

    const handleAddToCart = async (event, product) => {
        event.preventDefault();
        event.stopPropagation();

        if (!isAuthenticated) {
            const redirect = `${location.pathname}${location.search}`;
            navigate(`/login?redirect=${encodeURIComponent(redirect)}`);
            return;
        }

        if (!product || product.stock === 0 || addingProductId === product.id) {
            return;
        }

        try {
            setAddingProductId(product.id);
            await addItem(product.id, 1, {
                name: product.name,
                price: Number(product.price || 0),
                images: product.images,
                brand: product.brand,
            });

            setAddedProductId(product.id);
            window.setTimeout(() => setAddedProductId((current) => (current === product.id ? null : current)), 1200);
        } catch (error) {
            // Keep silent to avoid interrupting browsing flow.
        } finally {
            setAddingProductId(null);
        }
    };

    const hasActiveFilters = Boolean(selectedCategory) || Boolean(selectedBrand);

    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / productsPerPage));

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * productsPerPage;
        return filteredProducts.slice(start, start + productsPerPage);
    }, [filteredProducts, currentPage]);

    if (loading) {
        return (
            <div className="min-h-screen pt-32 grid place-items-center bg-gradient-to-b from-slate-50 to-slate-100">
                <div className="text-center bg-white/90 border border-slate-200 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-sm">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 border-4 border-slate-200 border-t-orange-500 rounded-full mx-auto mb-3.5 animate-spin" />
                    <div className="text-sm sm:text-base text-slate-600 font-semibold tracking-wide">
                        Loading products...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pt-24">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                <div className="mb-4 sm:mb-6 flex flex-col gap-2">
                    <span className="inline-flex self-start px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-extrabold tracking-widest uppercase">
                        Catalog
                    </span>
                    <h1 className="m-0 text-2xl sm:text-3xl lg:text-4xl text-slate-900 font-extrabold tracking-tight">Browse Products</h1>
                    <p className="m-0 text-slate-600 text-sm sm:text-base">
                        Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> products
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 sm:gap-6 items-start">
                    <aside className="lg:sticky lg:top-24 w-full h-fit bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 self-start shadow-sm">
                        <div className="flex justify-between items-center mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-slate-200">
                            <div className="flex items-center gap-2 text-slate-900 font-black text-base sm:text-lg tracking-tight">
                                <Filter size={16} color="#f97316" />
                                <span>Filters</span>
                            </div>
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    className="border-none bg-transparent text-orange-600 font-bold cursor-pointer text-xs sm:text-sm"
                                >
                                    Clear
                                </button>
                            )}
                        </div>

                        <section className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-slate-100">
                            <h3 className="m-0 mb-2 sm:mb-3 text-xs sm:text-sm text-slate-700 uppercase tracking-widest font-extrabold">Categories</h3>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-slate-800 bg-white appearance-none cursor-pointer"
                            >
                                <option value="">All categories</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </section>

                        <section className="mt-4 sm:mt-6">
                            <h3 className="m-0 mb-2 sm:mb-3 text-xs sm:text-sm text-slate-700 uppercase tracking-widest font-extrabold">Brands</h3>
                            <select
                                value={selectedBrand}
                                onChange={(e) => setSelectedBrand(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-slate-800 bg-white appearance-none cursor-pointer"
                            >
                                <option value="">All brands</option>
                                {brands.map((brand) => (
                                    <option key={brand} value={brand}>
                                        {brand}
                                    </option>
                                ))}
                            </select>
                        </section>
                    </aside>

                    <main>
                        {filteredProducts.length === 0 ? (
                            <div className="bg-white/95 border border-slate-200 rounded-xl sm:rounded-2xl p-6 sm:p-10 text-center shadow-sm">
                                <h3 className="m-0 text-slate-900 text-lg sm:text-xl font-bold">No products found</h3>
                                <p className="m-2 sm:m-3 mt-2 sm:mt-3 text-slate-600 text-sm sm:text-base">Try changing filters or the search term.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                {paginatedProducts.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onAddToCart={handleAddToCart}
                                        isAdding={addingProductId === product.id}
                                        isAdded={addedProductId === product.id}
                                    />
                                ))}
                            </div>
                        )}

                        {filteredProducts.length > productsPerPage && (
                            <div className="mt-4 sm:mt-6 flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="border border-slate-300 bg-white text-slate-700 font-bold rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed text-sm sm:text-base"
                                >
                                    Previous
                                </button>

                                <span className="text-sm sm:text-base text-slate-600 font-bold">
                                    Page {currentPage} of {totalPages}
                                </span>

                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="border border-slate-300 bg-white text-slate-700 font-bold rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed text-sm sm:text-base"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}


// Product Card Component
function ProductCard({ product, onAddToCart, isAdding, isAdded }) {
    const [imageError, setImageError] = useState(false);
    const [imageSrc, setImageSrc] = useState(() => resolveProductImage(product.images));
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        setImageError(false);
        setImageSrc(resolveProductImage(product.images));
    }, [product.images]);

    return (
        <div
            className="block bg-white border border-slate-200 rounded-xl sm:rounded-2xl overflow-hidden text-inherit shadow-sm transition-all duration-300 relative group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative w-full h-48 sm:h-60 bg-slate-50 overflow-hidden">
                {!imageError ? (
                    <img
                        src={imageSrc}
                        alt={product.name}
                        className="w-full h-full object-contain p-4 sm:p-5 transition-transform duration-300 group-hover:scale-105"
                        onError={(event) => {
                            if (event.currentTarget.dataset.fallbackApplied === '1') {
                                setImageError(true);
                                return;
                            }
                            event.currentTarget.dataset.fallbackApplied = '1';
                            setImageSrc(FALLBACK_PRODUCT_IMAGE);
                        }}
                    />
                ) : (
                    <div className="w-full h-full grid place-items-center text-slate-300">
                        <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}

                {product.stock === 0 && (
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                        Out of Stock
                    </div>
                )}
                {product.stock > 0 && product.stock < 10 && (
                    <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                        Low Stock
                    </div>
                )}
                
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={12}
                                color="#fbbf24"
                                fill={i < 4 ? "#fbbf24" : "none"}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-5">
                <div className="mb-2">
                    <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                        {product.brand}
                    </span>
                </div>
                
                <h3 className="m-0 text-sm sm:text-base text-slate-900 font-semibold leading-relaxed min-h-[2.8rem] line-clamp-2 overflow-hidden">
                    {product.name}
                </h3>

                {product.sku && (
                    <p className="m-2 mt-2 text-xs text-slate-400 font-mono">SKU: {product.sku}</p>
                )}

                <div className="flex items-center justify-between my-4">
                    <div>
                        <p className="m-0 text-lg sm:text-xl text-slate-900 font-extrabold tracking-tight">
                            ₱{Number(product.price || 0).toFixed(2)}
                        </p>
                        <span className={`text-xs font-medium ${product.stock > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {product.stock > 0 ? `${product.stock} in stock` : 'Unavailable'}
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    disabled={product.stock === 0 || isAdding}
                    onClick={(event) => onAddToCart(event, product)}
                    className={`w-full border-none text-white font-semibold text-sm sm:text-base rounded-lg sm:rounded-xl py-3 cursor-pointer transition-all duration-200 ${
                        product.stock === 0 
                            ? 'bg-slate-200 cursor-not-allowed' 
                            : isAdded 
                                ? 'bg-emerald-600' 
                                : 'bg-orange-500 hover:bg-orange-600'
                    } ${product.stock > 0 ? 'shadow-lg shadow-orange-500/30' : ''}`}
                >
                    {isAdding ? 'Adding...' : isAdded ? '✓ Added' : 'Add to Cart'}
                </button>
            </div>
        </div>
    );
}
