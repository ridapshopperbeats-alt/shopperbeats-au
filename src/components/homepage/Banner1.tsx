"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function Banner1() {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 7);

  return (
    <div className="sale-banner mb-70">
      <div className="container">
        <div className="dflex no-wrap">
          <div className="sale-img">
            <Image
              src="/images/headphone.png"
              alt="Headphone"
              width={186}
              height={250}
              style={{ width: '100%', height: 'auto', maxWidth: '300px' }}
            />
          </div>

          <div className="extra-sale">
            <Image
              src="/images/sale.png"
              alt="Extra Sale"
              width={312}
              height={102}
              style={{ width: '100%', height: 'auto', maxWidth: '150px' }}
            />
          </div>

          <div className="sale-content align-center">
            <h5>Sony WF-1000XM5 The Best</h5>
            <p>Use Code</p>
            <span className="code btn btn-red btn-filled">SALE20</span>
            <br />
          </div>

          <div className="sale-btn">
            <Link href="/product/49e998d2-718c-4b50-9b4b-5c3639458d35?category=Furniture" className="btn btn-white">
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
