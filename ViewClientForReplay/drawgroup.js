        function DrawGroup() {
            var draw_str;
            var group_id_input = document.getElementById("draw_group_input").value;
            var member_id_input = document.getElementById("team_member_input").value;
            
            if( null != group_id_input.match(/\d+/) &&  null != member_id_input.match(/\d+/) )
            {
                var group_id = group_id_input.match(/\d+/);
                var member_id = member_id_input.match(/\d+/);
                draw_str = 'draw group for '+ group_id[0] + ' by '+ member_id[0] + '\n';
            }
            else
            {                                
            }
                                        
            socket_of_view.send(draw_str);
        }
        
        function GetDrawResultMsg(msg_str) {
            var group_id = msg_str.match(/\d+/);
            if(group_id == null)
            {
                document.getElementById("draw_result").innerHTML = "无效抽签";
            }
            else
            {
                if (null != msg_str.match('success'))
                {
                    document.getElementById("draw_result").innerHTML = "抽签结果：小组G"+ group_id[0];
                }
                else if(null != msg_str.match('duplicated'))
                {
                    document.getElementById("draw_result").innerHTML = '你已分在小组G'+ group_id[0] +', 请勿重复抽签';
                }
                else
                {
                    document.getElementById("draw_result").innerHTML = msg_str;
                }
            }                                            
        } 