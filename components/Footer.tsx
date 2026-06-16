import React from "react";

export default function Footer() {
  return (
    <footer className="w-full py-4 text-center bg-white">
      <p className="text-sm text-[#010922]">
        <span className="font-bold">© 2025 DEPSTAR, CHARUSAT. All Rights Reserved.</span>
      </p>
      <p className="text-sm text-[#010922] mt-1">
        <span className="font-bold">Developed By:</span> Dr. Parth Goel and his Student Team,{" "}
        <span className="font-bold">For Queries and Support:</span> Mr. Sudheesh Patel ({" "}
        <a
          href="mailto:sudheeshpatel.dce@charusat.ac.in"
          className="text-[#1a5ca1] hover:underline"
        >
          sudheeshpatel.dce@charusat.ac.in
        </a>{" "}
        )
      </p>
    </footer>
  );
}