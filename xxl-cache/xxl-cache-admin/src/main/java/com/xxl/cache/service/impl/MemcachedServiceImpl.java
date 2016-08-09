package com.xxl.cache.service.impl;

import com.xxl.cache.core.model.MemcachedTemplate;
import com.xxl.cache.core.util.JacksonUtil;
import com.xxl.cache.core.util.ReturnT;
import com.xxl.cache.core.util.XMemcachedUtil;
import com.xxl.cache.dao.IMemcachedDao;
import com.xxl.cache.service.IMemcachedService;
import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by xuxueli on 16/8/9.
 */
@Service
public class MemcachedServiceImpl implements IMemcachedService {
    private static Logger logger = LogManager.getLogger();

    @Resource
    private IMemcachedDao memcachedDao;

    @Override
    public Map<String, Object> pageList(int offset, int pagesize, String key) {

        Map<String, Object> params = new HashMap<String, Object>();
        params.put("offset", offset);
        params.put("pagesize", pagesize);
        params.put("key", key);

        List<MemcachedTemplate> data = memcachedDao.pageList(params);
        int list_count = memcachedDao.pageListCount(params);

        // package result
        Map<String, Object> maps = new HashMap<String, Object>();
        maps.put("data", data);
        maps.put("recordsTotal", list_count);		// 总记录数
        maps.put("recordsFiltered", list_count);	// 过滤后的总记录数
        return maps;
    }

    @Override
    public ReturnT<String> save(MemcachedTemplate memcachedTemplate) {
        if (StringUtils.isBlank(memcachedTemplate.getKey())) {
            return new ReturnT<String>(500, "请输入“缓存Key”");
        }
        if (StringUtils.isBlank(memcachedTemplate.getIntro())) {
            return new ReturnT<String>(500, "请输入“简介”");
        }
        memcachedDao.save(memcachedTemplate);
        return ReturnT.SUCCESS;
    }

    @Override
    public ReturnT<String> update(MemcachedTemplate memcachedTemplate) {
        if (StringUtils.isBlank(memcachedTemplate.getKey())) {
            return new ReturnT<String>(500, "请输入“缓存Key”");
        }
        if (StringUtils.isBlank(memcachedTemplate.getIntro())) {
            return new ReturnT<String>(500, "请输入“简介”");
        }
        memcachedDao.update(memcachedTemplate);
        return ReturnT.SUCCESS;
    }

    @Override
    public ReturnT<String> delete(int id) {
        memcachedDao.delete(id);
        return ReturnT.SUCCESS;
    }

    @Override
    public ReturnT<Map<String, Object>> getCacheInfo(String finalKey) {
        Object cacheVal = XMemcachedUtil.get(finalKey);
        if (cacheVal==null) {
            return new ReturnT(500, "缓存数据不存在");
        }

        // detail
        String info = cacheVal.toString();
        String type = cacheVal.getClass().getName();
        int length = 1;
        if (cacheVal instanceof List) {
            length = ((List) cacheVal).size();
        }
        String json = JacksonUtil.writeValueAsString(cacheVal);

        Map<String, Object> cacheInfo = new HashMap<String, Object>();
        cacheInfo.put("type", type);
        cacheInfo.put("length", length);
        cacheInfo.put("info", info);
        cacheInfo.put("json", json);

        return new ReturnT<Map<String, Object>>(cacheInfo);
    }

    @Override
    public ReturnT<String> removeCache(String finalKey) {
        boolean ret = XMemcachedUtil.delete(finalKey);
        return ret?ReturnT.SUCCESS:ReturnT.FAIL;
    }

}