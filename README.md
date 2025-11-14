**AfreenJewels**
An elegant and modern online jewellery shopping platform built with Node.js and Express, featuring a responsive frontend designed to emulate the user experience of popular e-commerce sites. This full-stack web application allows users to browse, search, filter, and purchase exquisite jewellery items, manage wishlists, shopping carts, and orders.

## Features
1. Browse a curated collection of necklaces, earrings, bracelets, and rings with detailed descriptions, images, and pricing.
2. Register and login to access personalized features.
3. Advanced search functionality with category-based filtering (Necklaces, Earrings, Bracelets, Rings).
4. Add/remove items to/from wishlist for future reference.
5.  Add items to cart, update quantities, and proceed to checkout.
6.  Place orders with detailed forms, track order status, and view order history.
7.  Select payment methods and simulate payment processing.
8.  Real-time order status updates with tracking numbers and delivery estimates.
9.  Mobile-friendly UI using Bootstrap, inspired by Palmonas Jewellery's elegant aesthetic.

### Additional Features
1. Share products on social media.
2. View personal orders, wishlist, and account details.
3. (Future enhancement) Manage products, users, and orders.

## Tech Stack

### Backend
- **Node.js**: JavaScript runtime for server-side development.
- **Express.js**: Web framework for building RESTful APIs.
- **Body-Parser**: Middleware for parsing request bodies.
- **UUID**: For generating unique identifiers.
- **File System (fs)**: JSON file-based data storage for simplicity (products, users, cart, orders, wishlist).

### Frontend
- **HTML5**: Structure and content.
- **CSS3**: Custom styling with Bootstrap for responsive design.
- **JavaScript (ES6+)**: Client-side interactivity and API integration.
- **Bootstrap 5**: CSS framework for modern, responsive UI components.
- **Font Awesome**: Icons for enhanced visual elements.

### Development Tools
- **NPM**: Package management.
- **Git**: Version control.

## Installation

### Prerequisites
- Node.js (v14 or higher) installed on your system.
- NPM (comes with Node.js).

### Steps
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/afreenjewels.git
   cd afreenjewels
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Server**:
   ```bash
   node server.js
   ```
   The server will run on `http://localhost:3000`.

4. **Access the Application**:
   - Open your browser and navigate to `http://localhost:3000`.
   - The homepage will load, and you can start browsing products.

## Usage

### For Users
- **Browse Products**: Visit the homepage to view all products or filter by category.
- **Search**: Use the search bar to find specific items.
- **Account Management**: Register or login to access wishlist, cart, and orders.
- **Shopping**: Add items to cart, proceed to checkout, and simulate payment.
- **Order Tracking**: View order status and tracking details after purchase.

### For Developers
- **API Endpoints**: The backend exposes RESTful APIs for products, users, cart, orders, and wishlist. See below for details.
- **Customization**: Modify `models/*.json` for sample data, or integrate a database for production.
- **Testing**: Use tools like Postman to test API endpoints.

## API Endpoints

### Products
- `GET /api/products` - Retrieve all products.
- `GET /api/products/:id` - Retrieve a specific product by ID.
- `POST /api/products` - Add a new product (admin use).
- `PUT /api/products/:id` - Update a product (admin use).
- `DELETE /api/products/:id` - Delete a product (admin use).

### Users
- `POST /api/users/register` - Register a new user.
- `POST /api/users/login` - Login a user.
- `GET /api/users/:id` - Get user details (authenticated).

### Cart
- `GET /api/cart/:userId` - Get user's cart items.
- `POST /api/cart` - Add item to cart.
- `PUT /api/cart/:id` - Update cart item quantity.
- `DELETE /api/cart/:id` - Remove item from cart.

### Orders
- `GET /api/orders/:userId` - Get user's orders.
- `POST /api/orders` - Place a new order.
- `PUT /api/orders/:id` - Update order status (admin use).

### Wishlist
- `GET /api/wishlist/:userId` - Get user's wishlist.
- `POST /api/wishlist` - Add item to wishlist.
- `DELETE /api/wishlist/:id` - Remove item from wishlist.

*Note: Authentication is required for user-specific endpoints. Use JWT or session-based auth in production.*




## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature (`git checkout -b feature/new-feature`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature/new-feature`).
5. Create a Pull Request.


## Author

- **Afreen Naaz** - *Developer* - [afreennaaz261@gmail.com](mailto:afreennaaz261@gmail.com)

## Acknowledgments

- Images sourced from Unsplash and Pinterest for demonstration purposes.
- Thanks to the open-source community for tools like Express, Bootstrap, and Font Awesome.



For any questions or support, please contact [afreennaaz261@gmail.com](mailto:afreennaaz261@gmail.com).
