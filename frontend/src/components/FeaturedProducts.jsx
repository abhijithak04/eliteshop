"use client"

import { useState, useEffect } from "react"
import { Row, Col, Container } from "react-bootstrap"
import { motion } from "framer-motion"

import ProductCard from "./ProductCard"
import Loader from "./Loader"
import Message from "./Message"

import axios from "../utils/axios"

const FeaturedProducts = () => {

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {

    const fetchTopProducts = async () => {

      try {

        const { data } =
          await axios.get("/products/top")

        setProducts(data)

      } catch (error) {

        setError(
          error.response?.data?.message ||
          error.message
        )

      } finally {

        setLoading(false)

      }

    }

    fetchTopProducts()

  }, [])



  if (loading) {
    return <Loader />
  }

  if (error) {
    return (
      <Message variant="danger">
        {error}
      </Message>
    )
  }



  return (

    <section className="py-5">

      <Container>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-5"
        >

          <h2 className="display-5 fw-bold mb-3">
            Featured Products
          </h2>

          <p className="lead text-muted">
            Check out our top-rated products loved by customers
          </p>

        </motion.div>



        <Row>

          {products.map((product, index) => (

            <Col
              key={product._id}
              sm={12}
              md={6}
              lg={4}
              className="mb-4"
            >

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                }}
              >

                <ProductCard product={product} />

              </motion.div>

            </Col>

          ))}

        </Row>

      </Container>

    </section>

  )

}

export default FeaturedProducts