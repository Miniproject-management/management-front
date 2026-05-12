import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createLeaveBalanceApi } from "../../api/leaveBalanceApi";

import "../../styles/leaveBalance.css";

function LeaveBalancePage() {
  const navigate = useNavigate();

  const [formData, setFormData] =
    useState({
      empNo: "",
      year: new Date().getFullYear(),
      totalLeave: "",
    });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createLeaveBalanceApi(
        formData
      );

      alert("연차 생성 완료");

      navigate("/approval");
    } catch (error) {
      console.error(error);

      alert("연차 생성 실패");
    }
  };

  return (
    <div className="balance-page">
      <div className="balance-card">
        <h1>연차 생성</h1>

        <form
          className="balance-form"
          onSubmit={handleSubmit}
        >
          {/* 사번 */}
          <div className="form-group">
            <label>사번</label>

            <input
              type="number"
              name="empNo"
              value={formData.empNo}
              onChange={handleChange}
              required
            />
          </div>

          {/* 연도 */}
          <div className="form-group">
            <label>연도</label>

            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
            />
          </div>

          {/* 총 연차 */}
          <div className="form-group">
            <label>총 연차</label>

            <input
              type="number"
              name="totalLeave"
              value={
                formData.totalLeave
              }
              onChange={handleChange}
              required
            />
          </div>

          <div className="balance-actions">
            <button
              type="submit"
              className="create-btn"
            >
              연차 생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LeaveBalancePage;