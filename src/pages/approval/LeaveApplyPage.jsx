import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { applyLeaveApi } from "../../api/leaveApi";

import useAuthStore from "../../stores/authStore";

import "../../styles/leaveApply.css";

function LeaveApplyPage() {
  const navigate = useNavigate();

  const { empNo } = useAuthStore();

  const [formData, setFormData] =
    useState({
      empNo: empNo,
      leaveType: "",
      startDate: "",
      endDate: "",
      requestDays: "",
      reason: "",
    });

  // input 변경
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // 신청
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await applyLeaveApi(formData);

      alert("연차 신청 완료");

      navigate("/approval");
    } catch (error) {
      console.error(error);

      alert("연차 신청 실패");
    }
  };

  return (
    <div className="apply-page">
      <div className="apply-card">
        <h1>연차 신청</h1>

        <form
          className="apply-form"
          onSubmit={handleSubmit}
        >
          {/* 휴가 유형 */}
          <div className="form-group">
            <label>휴가 유형</label>

            <select
              name="leaveType"
              value={formData.leaveType}
              onChange={handleChange}
              required
            >
              <option value="">
                선택하세요
              </option>

              <option value="연차">
                연차
              </option>

              <option value="반차">
                반차
              </option>

              <option value="병가">
                병가
              </option>
            </select>
          </div>

          {/* 시작일 */}
          <div className="form-group">
            <label>시작일</label>

            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>

          {/* 종료일 */}
          <div className="form-group">
            <label>종료일</label>

            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>

          {/* 신청 일수 */}
          <div className="form-group">
            <label>신청 일수</label>

            <input
              type="number"
              step="0.5"
              name="requestDays"
              value={
                formData.requestDays
              }
              onChange={handleChange}
              required
            />
          </div>

          {/* 사유 */}
          <div className="form-group">
            <label>사유</label>

            <textarea
              name="reason"
              rows="5"
              value={formData.reason}
              onChange={handleChange}
            />
          </div>

          {/* 버튼 */}
          <div className="apply-actions">
            <button
              type="submit"
              className="submit-btn"
            >
              신청하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LeaveApplyPage;