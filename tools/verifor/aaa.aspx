        <div class="content-block required">
            <div class="block-title">
                <asp:Literal ID="LabelCourseInfo" runat="server" />
            </div>
            <div runat="server" id="requiredTrainingDetails" class="content">
                <telerik:RadTreeView ID="RadTreeViewRequiredTrainingDetails" runat="server" OnNodeDataBound="RadTreeViewTrainingDetails_OnNodeDataBound"
                    OnClientNodeClicking="OnClientNodeClicking">
                    <NodeTemplate>
                        <asp:HyperLink CssClass="content-item" ID="ContentItemRequired" runat="server">
                            <input type="hidden" class="materialStatus" value="<%#Eval("tlkRecordStatusTypes") %>" />
                            <asp:Label ClientIDMode="Static" ID="RequiredStatustextClassName" CssClass="item-icon"
                                runat="server" Visible="true" />
                            <div class="item-info">
                                <div class="item-title" title="<%#Eval("TPItemTitle") %>">
                                    <span class="materialItemTitleText"><%#Eval("TPItemTitle") %></span>
                                    <asp:Label ClientIDMode="Static" ID="RequiredStatusText" CssClass="materialItemStatusText"
                                        runat="server" Visible="true" />
                                </div>
                                <div class="item-status-info">
                                    <asp:Label CssClass="locked" ID="lblstatusOptional" runat="server" Visible="true" />
                                </div>
                                <div class="item-timer-message">
                                    <asp:Label ID="lblTimerMessage" runat="server" Visible="false" />
                                </div>
                                <div class="item-error-message">
                                    <asp:Label ID="lblErrorMessage" runat="server" Visible="false" />
                                </div>
                                <div class="item-text" title="<%#Eval("TPItemDescription") %>">
                                    <%#Eval("TPItemDescription") %>
                                </div>
                            </div>
                        </asp:HyperLink>
                    </NodeTemplate>
                </telerik:RadTreeView>
            </div>


            <div runat="server" id="divNoCourseContent" visible="false" class="content-block empty-state">
                <div class="block-title">
                    <asp:Literal ID="litCourseTitle" runat="server" />
                </div>
                <div class="content empty-content-message">
                    <asp:Literal ID="litNoCourseContentMessage" runat="server" Text="There is no content for this course." />
                </div>
                <div class="no-content-icon"></div>
            </div>




        </div>






        
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center !important;
    justify-content: center !important;
    text-align: center !important;
}


.empty-content-message {
    margin-top: 10px;
    color: #666;
}


.no-content-icon {
    width: 128px;
    height: 128px;
    margin-top: 10px;
    background-image: url("Icons/no-materials-icon.svg");
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
}


ViewState["FirstUpdatedMaterial"] = updatedTrainingProgramDetailMembers.Count > 0 ? updatedTrainingProgramDetailMembers.First().TPItemId : 0;
ConfigureTreeViewTrainingDetails(RadTreeViewRequiredTrainingDetails, requiredTrainingProgramDetailMembers);
ConfigureTreeViewTrainingDetails(RadTreeViewUpdatedTrainingDetails, updatedTrainingProgramDetailMembers);
ConfigureTreeViewTrainingDetails(RadTreeViewOptionalTrainingDetails, optionalTrainingProgramDetailMembers);

requiredTrainingDetails.Visible = requiredTrainingProgramDetailMembers.Count != 0;
optionalTrainingDetails.Visible = optionalTrainingProgramDetailMembers.Count != 0;
          
if (requiredTrainingProgramDetailMembers.Count == 0
    && optionalTrainingProgramDetailMembers.Count == 0
    && updatedTrainingProgramDetailMembers.Count == 0)
{
 
    requiredTrainingDetails.Visible = false;
    optionalTrainingDetails.Visible = false;
    divNoCourseContent.Visible = true;
    litNoCourseContentMessage.Text = "No course materials to display yet.";
}
else
{
    divNoCourseContent.Visible = false;
}
//BarPercentageCourse.Percentage = 0;
if ((selectedTrainingcourse != null && selectedTrainingcourse.TPItemTypeId != null &&
     (((TrainingProgramType)selectedTrainingcourse.TPItemTypeId == TrainingProgramType.Course &&
       this.GetCurrentInstance.TrainingProgramDetails.Count > 1))))
{
